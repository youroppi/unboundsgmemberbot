// index.js
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config(); // if you want to load environment variables from .env

const keys = require('./credentials.json'); // JSON with your Google API credentials

// 1. Initialize the bot
const bot = new Telegraf(process.env.BOT_TOKEN); 
// or const bot = new Telegraf('<YOUR_BOT_API_TOKEN>');

// 2. Configure Google Sheets
const auth = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);
const sheets = google.sheets({ version: 'v4', auth });

// 3. Telegram bot setup
// You can store your bot token in an environment variable BOT_TOKEN for security, or paste it directly
// e.g., const bot = new Telegraf('1234567:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
const bot = new Telegraf(process.env.BOT_TOKEN);

// /start command
bot.start((ctx) => {
  return ctx.reply(
    "Welcome to Unbound Singapore Bot!\n\nChoose an option below:",
    {
      reply_markup: {
        keyboard: [
          ["/points", "/howtoredeem"],
          ["/prizes"]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }
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
// New /howtoredeem command
bot.command('howtoredeem', (ctx) => {
  ctx.reply(
    "You can message our admin @idekrus to redeem your points.\n" +
    "Prizes vary from time to time."
  );
});

// New /prizes command
bot.command('prizes', (ctx) => {
  ctx.reply(
    "Current point redemption:\n" +
    "• 15 points → $2 Mr Bean vouchers\n" +
    "• 30 points → $10 Grab Vouchers\n" +
    "• 50 points → $20 Grab Vouchers\n" +
    "• 75 points → $30 Frasers Vouchers\n" +
    "More to come!"
  );
});

// Launch bot
bot.launch();