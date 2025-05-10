/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

// JWT client for service account auth
const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets = google.sheets({ version: 'v4', auth: jwtClient });
const spreadsheetId = process.env.SHEET_ID;
const sheetName = 'counts';

// helper to read A:D with formatted values
async function readRaw() {
  await jwtClient.authorize();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:D`,
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const [headers, ...rest] = data.values || [];
  return { headers, rows: rest };
}

export default async function handler(req, res) {
  try {
    const { method } = req;
    if (method === 'GET') {
      const month = req.query.month;
      const { rows } = await readRaw();
      const row = rows.find(r => r[1] === month) || [];
      const felix = parseInt(row[2] || 0, 10);
      const anna  = parseInt(row[3] || 0, 10);
      return res.json({ felix, anna });
    }

    if (method === 'POST') {
      const { month, felix, anna } = req.body;
      const { rows } = await readRaw();
      const existingIdx = rows.findIndex(r => r[1] === month);

      if (existingIdx > -1) {
        // update C:D
        const rowNum = existingIdx + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!C${rowNum}:D${rowNum}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[felix, anna]],
          },
        });
      } else {
        // append new row [id, month, felix, anna]
        const newId = rows.length + 1;
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:D`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [[newId, month, felix, anna]],
          },
        });
      }

      return res.json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (e) {
    console.error('Error in /api/counts:', e);
    res.status(500).json({ error: 'could not update counts', details: e.message });
  }
}
