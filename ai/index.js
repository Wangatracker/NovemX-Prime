const chatWithAI = require("./ai.js");

client.on("message", async (message) => {
    if (message.body.startsWith(".")) {
        handleCommand(message);
    } else if (config.ai_enabled) {
        const reply = await chatWithAI(message.body);
        message.reply(reply);
    }
});￼Enter
