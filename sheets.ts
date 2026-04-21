import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

let auth: any = null;
let sheets: any = null;

try {
  if (SERVICE_ACCOUNT) {
    const credentials = JSON.parse(SERVICE_ACCOUNT);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheets = google.sheets({ version: 'v4', auth });
  }
} catch (e) {
  console.warn("Google Sheets Auth failed. Falling back to local data.", e);
}

export async function getSheetData(range: string) {
  if (!sheets || !SHEET_ID) return null;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });
    return response.data.values;
  } catch (e) {
    console.error(`Error fetching sheet range ${range}:`, e);
    return null;
  }
}

export async function appendSheetData(range: string, values: any[][]) {
  if (!sheets || !SHEET_ID) return null;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    return true;
  } catch (e) {
    console.error(`Error appending to sheet range ${range}:`, e);
    return false;
  }
}

// Map Google Sheet Rows to Property Objects
export function mapRowsToProperties(rows: any[][]) {
  if (!rows || rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map((row, index) => {
    const item: any = {};
    headers.forEach((header: string, i: number) => {
      if (header) {
        item[header.toLowerCase().trim()] = row[i];
      }
    });

    try {
      // Ensure numeric types
      if (item.bhk) {
        const parsedBhk = parseInt(item.bhk);
        item.bhk = isNaN(parsedBhk) ? item.bhk : parsedBhk;
      }
      
      // Parse amenities safely
      if (item.amenities && typeof item.amenities === 'string') {
        item.amenities = item.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (!Array.isArray(item.amenities)) {
        item.amenities = [];
      }
    } catch (e) {
      console.warn("Row parse issue:", e);
    }
    
    if (!item.id) item.id = `sheet_${index}`;
    return item;
  });
}

// Map Market Rates
export function mapRowsToRates(rows: any[][]) {
  if (!rows || rows.length <= 1) return {};
  const rates: any = {};
  rows.slice(1).forEach(row => {
    const [location, baseRate, rentRate] = row;
    rates[location.toLowerCase()] = {
      baseRate: parseFloat(baseRate),
      rentRate: parseFloat(rentRate)
    };
  });
  return rates;
}
