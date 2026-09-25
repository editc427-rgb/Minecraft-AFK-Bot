const mineflayer = require('mineflayer');
const config = require('./config.json');

const PROXY_PASSWORD = "8455930";

const bot = mineflayer.createBot({
  host: config.serverHost,
  port: config.serverPort,
  username: "patt070", // Double locking your cracked username
  auth: 'offline',     // Kept offline since it's cracked
  version: "1.21.1",
  viewDistance: config.botChunk
});

// Bypasses proxy filters by locking the network stream protocol to 1.21.1
bot.protocolVersion = 767;

let movementPhase = 0;
const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;

// FIX: Automatically sends client settings packet immediately to stop proxy kicks
bot.on('login', () => {
  if (bot._client) {
    bot._client.write('settings', {
      locale: 'en_US',
      viewDistance: 1,
      chatFlags: 0,
      chatColors: true,
      skinParts: 127,
      mainHand: 1,
      enableTextFiltering: false,
      allowServerListings: true
    });
  }
});

bot.on('spawn', () => {
  console.log(`📡 Connected to Proxy. Attempting authentication...`);

  // 1. Send the login password to the proxy server after 2.5 seconds
  setTimeout(() => {
    bot.chat(`/login ${PROXY_PASSWORD}`);
    console.log(`🔑 Sent login command to proxy server.`);
  }, 2500);

  // 2. Transfer from proxy hub into the SMP after 6 seconds
  setTimeout(() => {
    bot.chat('/smp'); 
    console.log(`🚀 Sending /smp command to cross proxy portal.`);
  }, 6000);

  // 3. Initiate standard anti-AFK movements once safely past proxy portal
  setTimeout(() => {
    bot.setControlState('sneak', true);
    console.log(`✅ patt070 is Ready in the AFK Zone!`);
  }, 9000);

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
  console.error('⚠️ Error Logged:', err.message || err);
});

bot.on('end', (reason) => {
  console.log(`%c⛔️ Bot Disconnected! Reason: ${reason || 'Unknown Protocol Halt'}`, "color: red");
});
