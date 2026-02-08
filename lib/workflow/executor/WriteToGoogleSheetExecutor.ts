import { google } from 'googleapis';
import { ExecutionEnvironment } from '@/types/executor';
import { WriteToGoogleSheetTask } from '../task/WriteToGoogleSheetTask';
import fs from 'fs';
import path from 'path';

export async function WriteToGoogleSheetExecutor(
    environment: ExecutionEnvironment<typeof WriteToGoogleSheetTask>
): Promise<boolean> {
    try {
        const spreadsheetLink = environment.getInput('Spreadsheet Link');
        const sheetName = environment.getInput('Sheet Name');
        const values = environment.getInput('Values');

        if (!spreadsheetLink || !sheetName || !values) {
            environment.log.error('Missing required inputs');
            return false;
        }

        // Extract Spreadsheet ID from Link
        // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
        const spreadsheetIdMatch = spreadsheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!spreadsheetIdMatch) {
            environment.log.error('Invalid Google Sheets link');
            return false;
        }
        const spreadsheetId = spreadsheetIdMatch[1];

        // Read credentials from local service-account.json
        let auth;
        try {
            const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
            if (!fs.existsSync(serviceAccountPath)) {
                environment.log.error('service-account.json not found in root directory');
                return false;
            }

            const keyFileContent = fs.readFileSync(serviceAccountPath, 'utf8');
            const key = JSON.parse(keyFileContent);

            auth = new google.auth.GoogleAuth({
                credentials: key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } catch (error: any) {
            environment.log.error(`Failed to load service account: ${error.message}`);
            return false;
        }

        const sheets = google.sheets({ version: 'v4', auth });

        let rows = [];
        let headers: string[] = [];
        try {
            const parsedValues = JSON.parse(values);
            if (Array.isArray(parsedValues) && parsedValues.length > 0) {
                const firstItem = parsedValues[0];
                if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
                    headers = Object.keys(firstItem);
                }
                rows = parsedValues.map(v => {
                    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                        return Object.values(v);
                    }
                    return Array.isArray(v) ? v : [v];
                });
            } else if (typeof parsedValues === 'object' && parsedValues !== null) {
                headers = Object.keys(parsedValues);
                rows = [Object.values(parsedValues)];
            } else {
                rows = [[parsedValues]];
            }
        } catch (error) {
            // If not JSON, treat as a single string/value
            rows = [[values]];
        }

        // Check if sheet is empty to add headers
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${sheetName}'!A1:Z1`,
        });

        const hasValues = response.data.values && response.data.values.length > 0;
        if (!hasValues && headers.length > 0) {
            rows.unshift(headers);
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `'${sheetName}'!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rows,
            },
        });

        environment.log.info(`Successfully appended ${rows.length} row(s) to ${sheetName}`);
        return true;
    } catch (error: any) {
        console.error(error, "GSHEET error");
        environment.log.error(error.message);
        return false;
    }
}
