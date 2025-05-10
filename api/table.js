/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

const jwtClient_table = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets_table = google.sheets({ version: 'v4', auth: jwtClient_table });
const spreadsheetId_table = process.env.SHEET_ID;
const sheetName_table = 'counts';

async function readRaw_table() {
  await jwtClient_table.authorize();
  const { data } = await sheets_table.spreadsheets.values.get({
    spreadsheetId: spreadsheetId_table,
    range: `${sheetName_table}!A:D`,
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const [, ...rest] = data.values || [];
  return rest;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const rows = await readRaw_table();
    const data = rows
      .map(r => ({
        month: r[1],
        felix: parseInt(r[2], 10),
        anna: parseInt(r[3], 10),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    res.json(data);
  } catch (e) {
    console.error('Error in /api/table:', e);
    res.status(500).json({ error: 'could not fetch table data', details: e.message });
  }
}