import { NewsItem } from '../server/analyzeHandler';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  rowsExported: number;
}

export async function exportToGoogleSheets(
  accessToken: string,
  items: NewsItem[],
  customTitle?: string
): Promise<ExportResult> {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const title = customTitle || `Portfolio Sentiment Tracker - ${timestamp} UTC`;

  // 1. Create a new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Sentiment Intelligence',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create Google Spreadsheet (HTTP ${createRes.status})`
    );
  }

  const createData = await createRes.json();
  const spreadsheetId = createData.spreadsheetId;
  const sheetId = createData.sheets?.[0]?.properties?.sheetId || 0;

  // 2. Prepare headers and rows
  const headerRow = [
    'Ticker',
    'Company / Entity',
    'Headline',
    'Sentiment',
    'Score (-1.0 to +1.0)',
    '1-Sentence Strategic Summary',
    'Macro Driver / Impact',
    'News Source',
    'Date / Time',
  ];

  const dataRows = items.map((item) => [
    item.ticker,
    item.companyName,
    item.headline,
    item.sentiment,
    item.sentimentScore.toFixed(2),
    item.strategicSummary,
    item.macroImpact,
    item.source,
    item.date,
  ]);

  const allValues = [headerRow, ...dataRows];

  // 3. Write data to the spreadsheet
  const range = `Sentiment Intelligence!A1:I${allValues.length}`;
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!writeRes.ok) {
    const writeErr = await writeRes.json().catch(() => ({}));
    throw new Error(writeErr?.error?.message || 'Failed to populate Google Sheets data');
  }

  // 4. Apply Bloomberg styling via batchUpdate (header styling, auto-formatting, wrap text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format header row: dark navy background (#0F172A), white bold text
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 9,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.07, green: 0.09, blue: 0.15 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1.0, green: 0.75, blue: 0.15 }, // Amber gold
                    fontSize: 11,
                  },
                  horizontalAlignment: 'LEFT',
                  verticalAlignment: 'MIDDLE',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
            },
          },
          // Wrap text on columns C (Headline) and F (Strategic Summary)
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: allValues.length,
                startColumnIndex: 2,
                endColumnIndex: 3,
              },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat.wrapStrategy',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 1,
                endRowIndex: allValues.length,
                startColumnIndex: 5,
                endColumnIndex: 6,
              },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat.wrapStrategy',
            },
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
              },
              properties: { pixelSize: 90 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 2,
              },
              properties: { pixelSize: 180 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 2,
                endIndex: 3,
              },
              properties: { pixelSize: 380 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 3,
                endIndex: 4,
              },
              properties: { pixelSize: 110 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 4,
                endIndex: 5,
              },
              properties: { pixelSize: 100 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 5,
                endIndex: 6,
              },
              properties: { pixelSize: 420 },
              fields: 'pixelSize',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 6,
                endIndex: 9,
              },
              properties: { pixelSize: 160 },
              fields: 'pixelSize',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Styling batchUpdate warning (data was already written):', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title,
    rowsExported: items.length,
  };
}
