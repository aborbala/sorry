/* eslint-env node */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { google } from "googleapis";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// 1) set up a JWT client with your service-account creds
const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  null,
  // convert literal "\n" into real newlines
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

// 2) create the Sheets API client
const sheets = google.sheets({ version: "v4", auth: jwtClient });
const spreadsheetId = process.env.SHEET_ID;
const sheetName = "counts"; // the tab name

async function readRaw() {
  await jwtClient.authorize();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:D`,
    // make sure the API returns you exactly what you see in the UI, not numbers
    valueRenderOption: "FORMATTED_VALUE",
  });
  const [headers, ...rest] = data.values || [];
  return { headers, rows: rest };
}

// GET /api/counts?month=YYYY-MM-01
app.get("/api/counts", async (req, res) => {
  try {
    const month = req.query.month;
    const { rows } = await readRaw();
    const row = rows.find((r) => r[1] === month);
    const felix = row ? parseInt(row[2], 10) : 0;
    const anna = row ? parseInt(row[3], 10) : 0;
    res.json({ felix, anna });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "could not fetch counts" });
  }
});

// GET /api/table
app.get("/api/table", async (_, res) => {
  try {
    const { rows } = await readRaw();
    const data = rows
      .map((r) => ({
        month: r[1],
        anna: parseInt(r[3], 10),
        felix: parseInt(r[2], 10),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
    debugger;
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "could not fetch table data" });
  }
});

// POST /api/counts   { month, felix, anna }
app.post("/api/counts", async (req, res) => {
  try {
    const { month, felix, anna } = req.body;
    const { rows } = await readRaw(); // each r = [ id, month, felix, anna ]
    const existingIdx = rows.findIndex((r) => r[1] === month);

    if (existingIdx > -1) {
      // same month → overwrite columns C (Felix) & D (Anna)
      const rowNum = existingIdx + 2; // +1 for header, +1 because Sheets are 1-based
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!C${rowNum}:D${rowNum}`,
        valueInputOption: "RAW", // ← NO parsing
        requestBody: { values: [[felix, anna]] },
      });
    } else {
      // new month → append full row [id, month, felix, anna]
      const newId = rows.length + 1;
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:D`,
        valueInputOption: "RAW", // ← NO parsing
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[newId, month, felix, anna]] },
      });
    }

    res.json({ success: true });
  } catch (e) {
    console.error("🛑 Error in POST /api/counts:", e);
    res
      .status(500)
      .json({ error: "could not update counts", details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sheets API listening on http://localhost:${PORT}`);
});
