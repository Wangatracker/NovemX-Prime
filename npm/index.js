const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', qr => {
    console.log('Scan this QR Code to link WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('NovemX Prime is online!');
});

client.on('message', async message => {
    if (message.body.toLowerCase() === '.hello') {
        message.reply("Hello! I am NovemX Prime. How can I assist you?");
    } else if (message.body.toLowerCase() === '.health') {
        message.reply("I am connecting you to a health AI...");
    } else {
        message.reply("Unknown command. Type `.help` for available commands.");
    }
});

client.initialize();
