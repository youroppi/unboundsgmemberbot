// index.js
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const express = require('express');
const app = express();

// Render (and many other PaaS hosts) set a PORT environment variable.
// Fallback to 3000 if it's not set.
const PORT = process.env.PORT || 3000;

// Simple route just to show it's working.
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


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

// /start command
bot.start((ctx) => {
  return ctx.reply(
    "Welcome to Unbound Singapore Members Bot! Choose from one of the options below:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Check my points", callback_data: "POINTS_CMD" }
          ],
          [
            { text: "How to redeem my points", callback_data: "HOW_TO_REDEEM_CMD" }
          ],
          [
            { text: "Current Prizes", callback_data: "PRIZES_CMD" }
          ]
        ]
      }
    }
  );
});

// 5. Command: /points
// Points button
bot.action("POINTS_CMD", async (ctx) => {
  try {
    // Acknowledge the button press (required for inline keyboards)
    await ctx.answerCbQuery();
    
    // This can share the same logic as your /points command.
    // For example:
    const username = ctx.from.username;
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
    console.error(error);
    await ctx.reply("Something went wrong retrieving your points.");
  }
});

// How to redeem
bot.action("HOW_TO_REDEEM_CMD", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply("You can message our admin @idekrus to redeem your points. Prizes vary from time to time.");
  } catch (error) {
    console.error(error);
  }
});

// Current prizes
bot.action("PRIZES_CMD", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply(
      "Current point redemption:\n" +
      "• 15 points → $2 Mr Bean vouchers\n" +
      "• 30 points → $10 Grab Vouchers\n" +
      "• 50 points → $20 Grab Vouchers\n" +
      "• 75 points → $30 Frasers Vouchers\n" +
      "More to come!"
    );
  } catch (error) {
    console.error(error);
  }
});

// Launch bot
bot.launch();
