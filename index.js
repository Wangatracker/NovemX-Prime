const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Load configuration
const config = require("./config.json");

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
    console.log("Scan this QR code to link your WhatsApp:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ Bot is ready!");
});

client.on("message", async (message) => {
    if (message.body.startsWith(".")) {
        handleCommand(message);
    }
});

async function handleCommand(message) {
    const command = message.body.slice(1).trim().toLowerCase();

    if (command === "ping") {
        message.reply("Pong!");
    } else if (command === "help") {
        message.reply("List of commands:\n.ping - Check if bot is online\n.help - Show this message");
    } else {
        message.reply("❌ Unknown command. Type .help for a list of commands.");
    }
}

client.initialize();￼Enter
