const mineflayer = require('mineflayer');
const config = require('./config.json');

// SECURITY TIP: You can set a environment variable named BOT_PASSWORD on Render, 
// or simply replace "YOUR_ACTUAL_PASSWORD_HERE" with your password.
const PROXY_PASSWORD = process.env.BOT_PASSWORD || "YOUR_ACTUAL_PASSWORD_HERE";

const bot = mineflayer.createBot({
  host: config.serverHost,
  port: config.serverPort,
  username: config.botUsername,
  auth: 'offline',
  version: false,
  viewDistance: config.botChunk
});

let movementPhase = 0;
const STEP_INTERVAL = 1500;
const STEP_SPEED    = 1;
const JUMP_DURATION = 500;

bot.on('spawn', () => {
  console.log(`📡 Connected to Proxy. Attempting authentication...`);

  // 1. Send the login password to the proxy server after 2 seconds
  setTimeout(() => {
    bot.chat(`/login ${PROXY_PASSWORD}`);
    console.log(`🔑 Sent login command to proxy server.`);
  }, 2000);

  // 2. Transfer from proxy hub into survival server after 5 seconds
  setTimeout(() => {
    bot.chat('/server survival'); // Change 'survival' if QfieSMP uses a different name like '/anarchy' or '/q survival'
    console.log(`🚀 Sending transfer command to cross proxy portal.`);
  }, 5000);

  // 3. Initiate standard anti-AFK movements once safely past proxy portal
  setTimeout(() => {
    bot.setControlState('sneak', true);
    console.log(`✅ ${config.botUsername} is Ready in the AFK Zone!`);
  }, 8000);

  setTimeout(movementCycle, STEP_INTERVAL);
});

function movementCycle() {
  if (!bot.entity) return;

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
    case 1:
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      bot.setControlState('jump', false);
      break;
    case 2:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, JUMP_DURATION);
      break;
    case 3:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;

  setTimeout(movementCycle, STEP_INTERVAL);
}

bot.on('error', (err) => {
  console.error('⚠️ Error:', err);
});
bot.on('end', () => {
  console.log('⛔️ Bot Disconnected!');
});
