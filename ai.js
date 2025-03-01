const axios = require("axios");
const config = require("./config.json");

async function chatWithAI(prompt) {
    const response = await axios.post("https://api.openai.com/v1/completions", {
        model: "gpt-3.5-turbo",
        prompt: prompt,
        max_tokens: 100
    }, {
        headers: { "Authorization": `Bearer ${config.api_keys.openai}` }
    });

    return response.data.choices[0].text.trim();
}

module.exports = chatWithAI;￼Enter
