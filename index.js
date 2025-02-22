const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { exec } = require("child_process");
const { state, saveState } = useSingleFileAuthState("./auth.json");

const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
});

// AI Auto-Reply System
async function askAI(question) {
    try {
        let res = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }]
        }, {
            headers: { "Authorization": `Bearer YOUR_OPENAI_API_KEY` }
        });
        return res.data.choices[0].message.content;
    } catch (error) {
        return "AI is unavailable right now.";
    }
}

// Auto-Like Status Feature
const likedStatuses = new Set();
async function autoLikeStatus() {
    sock.ev.on("status.update", async ({ id }) => {
        if (!likedStatuses.has(id)) {
            likedStatuses.add(id);
            await sock.sendMessage(id, { text: "👍" });
        }
    });
}

// Handle Incoming Messages
sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || "";
    const sender = msg.key.remoteJid;

    if (text.startsWith("[.]apk ")) {
        let query = text.replace("[.]apk ", "").trim();
        let apkInfo = await searchAndDownloadAPK(query);
        sock.sendMessage(sender, { text: apkInfo ? `📥 Downloading ${apkInfo.name}...` : "❌ APK not found." });
    } else if (text.startsWith("[.]song ")) {
        let query = text.replace("[.]song ", "").trim();
        let songPath = await downloadSong(query);
        sock.sendMessage(sender, { document: { url: songPath }, mimetype: "audio/mpeg", fileName: `${query}.mp3` });
    } else if (text.startsWith("[.]movie ")) {
        let query = text.replace("[.]movie ", "").trim();
        let movieLink = await searchMovie(query);
        sock.sendMessage(sender, { text: movieLink ? `🎬 Movie Link: ${movieLink}` : "❌ Movie not found." });
    } else if (text.startsWith("[.]tiktok ")) {
        let url = text.replace("[.]tiktok ", "").trim();
        let videoPath = await downloadTikTok(url);
        sock.sendMessage(sender, { video: { url: videoPath }, caption: "🎥 TikTok Video" });
    } else if (text.startsWith("[.]instagram ")) {
        let url = text.replace("[.]instagram ", "").trim();
        let videoPath = await downloadInstagram(url);
        sock.sendMessage(sender, { video: { url: videoPath }, caption: "📸 Instagram Video" });
    } else if (text.startsWith("[.]ai ")) {
        let question = text.replace("[.]ai ", "").trim();
        let reply = await askAI(question);
        sock.sendMessage(sender, { text: reply });
    } else if (text.startsWith("[.]statuslike")) {
        autoLikeStatus();
        sock.sendMessage(sender, { text: "✅ Auto-like enabled!" });
    } else if (text.startsWith("[.]setimage ")) {
        let filePath = `./images/${text.replace("[.]setimage ", "").trim()}`;
        fs.writeFileSync(filePath, msg.message.imageMessage);
        sock.sendMessage(sender, { text: "✅ Image stored successfully." });
    }
});

// Functions for Downloading Content
async function searchAndDownloadAPK(appName) {
    try {
        let searchURL = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
        let { data } = await axios.get(searchURL);
        let $ = cheerio.load(data);
        let firstResult = $(".search-dl a").attr("href");
        return firstResult ? { name: appName, downloadLink: `https://apkpure.com${firstResult}` } : null;
    } catch (error) {
        return null;
    }
}

async function downloadSong(query) {
    try {
        let searchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+song`;
        let { data } = await axios.get(searchURL);
        let videoId = data.match(/"videoId":"(.*?)"/)[1];
        let videoURL = `https://www.youtube.com/watch?v=${videoId}`;
        let outputPath = `./songs/${query}.mp3`;
        exec(`yt-dlp -x --audio-format mp3 -o "${outputPath}" ${videoURL}`);
        return outputPath;
    } catch (error) {
        return null;
    }
}

async function searchMovie(query) {
    try {
        let searchURL = `https://moviebox.com/search?query=${encodeURIComponent(query)}`;
        let { data } = await axios.get(searchURL);
        let movieLink = data.match(/"stream_url":"(.*?)"/)[1];
        return movieLink || null;
    } catch (error) {
        return null;
    }
}

async function downloadTikTok(url) {
    try {
        let apiURL = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
        let { data } = await axios.get(apiURL);
        return data.videoUrl;
    } catch (error) {
        return null;
    }
}

async function downloadInstagram(url) {
    try {
        let apiURL = `https://instagram-downloader-api.com/?url=${encodeURIComponent(url)}`;
        let { data } = await axios.get(apiURL);
        return data.videoUrl;
    } catch (error) {
        return null;
    }
}

// Save Bot State
sock.ev.on("creds.update", saveState)
