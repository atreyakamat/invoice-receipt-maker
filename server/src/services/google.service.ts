import { google } from 'googleapis';
import prisma from '../utils/prisma';

export class GoogleService {
  private static getOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/integrations/google/callback'
    );
  }

  static getAuthUrl(orgId: string) {
    const oauth2Client = this.getOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets'],
      state: orgId, // Pass orgId so we know who authorized upon callback
    });
  }

  static async handleCallback(code: string, orgId: string) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      // Mock flow if no real client ID is configured
      await prisma.googleConnection.upsert({
        where: { organizationId: orgId },
        update: { refreshToken: 'mock_refresh_token', googleEmail: 'mock@gmail.com' },
        create: { organizationId: orgId, refreshToken: 'mock_refresh_token', googleEmail: 'mock@gmail.com' },
      });
      return;
    }

    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      await prisma.googleConnection.upsert({
        where: { organizationId: orgId },
        update: { refreshToken: tokens.refresh_token, googleEmail: 'unknown@gmail.com' }, // in reality, fetch email using google plus/oauth2 API
        create: { organizationId: orgId, refreshToken: tokens.refresh_token, googleEmail: 'unknown@gmail.com' },
      });
    }
  }

  static async pushInvoiceToSheet(orgId: string, invoiceData: any) {
    const connection = await prisma.googleConnection.findUnique({
      where: { organizationId: orgId }
    });

    if (!connection || !connection.syncEnabled) {
      return;
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('Mocking Google Sheet push for invoice', invoiceData.invoiceNumber);
      return;
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: connection.refreshToken });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // In a real app, spreadsheetId might be chosen by the user. 
    // If not set, create one or throw an error.
    let spreadsheetId = connection.spreadsheetId;
    if (!spreadsheetId) {
      const sheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: 'Invoice Sync' },
        }
      });
      spreadsheetId = sheet.data.spreadsheetId || null;
      await prisma.googleConnection.update({
        where: { organizationId: orgId },
        data: { spreadsheetId }
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId as string,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [invoiceData.invoiceNumber, invoiceData.invoiceDate, invoiceData.vendor?.name, invoiceData.total, invoiceData.status]
        ]
      }
    });
  }
}
