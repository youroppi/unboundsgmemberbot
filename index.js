// index.js
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config(); // if you want to load environment variables from .env

const googleCreds = JSON.parse(process.env.GOOGLE_CREDS);

// Some private_key fields have escaped newlines, so we handle that:
const auth = new google.auth.JWT(
  googleCreds.client_email,
  null,
  googleCreds.private_key.replace(/\\n/g, '\n'), // Convert literal \n to actual newlines
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const sheets = google.sheets({ version: 'v4', auth });

// 2. Authorize a JWT client with the service account
const auth = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key.replace(/\\n/g, '\n'), // Some JSON files contain \n instead of actual newlines
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

const sheets = google.sheets({ version: 'v4', auth });

// 3. Telegram bot setup
// You can store your bot token in an environment variable BOT_TOKEN for security, or paste it directly
// e.g., const bot = new Telegraf('1234567:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
const bot = new Telegraf(process.env.BOT_TOKEN);

// 4. Command: /start
bot.start((ctx) => {
  ctx.reply(
    `Welcome, ${ctx.from.username || ctx.from.first_name}! Type /points to see your points.`
  );
});

// 5. Command: /points
bot.command('points', async (ctx) => {
  try {
    const username = ctx.from.username; // or use ctx.from.id if you track IDs
    if (!username) {
      return ctx.reply('No username found in your Telegram profile.');
    }

    // Replace these values with your own
    const SPREADSHEET_ID = '1FlnwjpfpphwSUU1g7mRn62OCaUu2GjsxtIIsdYCIJTk';
    const RANGE = 'Sheet1!A:B'; // columns for TelegramUsername and Points

    // 6. Fetch the sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return ctx.reply('No data found in the spreadsheet.');
    }

    // 7. Look for the row that matches the user's Telegram username
    let userPoints = null;
    for (const row of rows) {
      if (row[0] === username) {
        userPoints = row[1];
        break;
      }
    }

    if (userPoints) {
      ctx.reply(`@${username}, you have ${userPoints} points!`);
    } else {
      ctx.reply(`No points found for @${username}.`);
    }
  } catch (error) {
    console.error('Error retrieving points:', error);
    ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// 8. Start the bot (long-polling)
bot.launch().then(() => {
  console.log('Bot is running. Press Ctrl+C to stop.');
});
