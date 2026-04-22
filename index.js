const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURATION ---
const config = {
    token: '8372538783:AAEWx9WApRSbvmnEfEByeEftS1iVBYvm6fg',
    myChatId: '8143587403',
    channelId: '-1003910635197',
    geminiKey: 'AIzaSyD26yJiilp8SvIvutDmGW1p_bu0pLbpq48'
};

const bot = new TelegramBot(config.token, { polling: true });
const WATERMARK = "\n\n🛡️ *Powered by PASIYA-MD*";

// --- HELPER FUNCTIONS ---
async function send(id, text) {
    try { 
        await bot.sendMessage(id, text, { parse_mode: "Markdown", disable_web_page_preview: true }); 
    } catch (e) { console.log("Error:", e.message); }
}

async function fetchNews() {
    try {
        const res = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=3');
        let text = "📰 *LATEST CRYPTO NEWS* 📰\n\n";
        res.data.Data.forEach(n => text += `🔹 [${n.title}](${n.url})\n\n`);
        return text + WATERMARK;
    } catch (e) { return "❌ News update failed."; }
}

async function getSignals() {
    const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT'];
    let report = `💎 *PASIYA-CRYPTO V4 PREMIUM* 💎\n\n🎯 *ANALYSIS ON 10 ASSETS:*\n\n`;
    let aiData = "";

    for (const coin of coins) {
        try {
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const p = parseFloat(res.data.lastPrice);
            const c = parseFloat(res.data.priceChangePercent);
            const action = c > 0 ? "LONG 📈" : "SHORT 📉";
            const tp = c > 0 ? p * 1.018 : p * 0.982;
            const sl = c > 0 ? p * 0.985 : p * 1.015;

            report += `🔸 *${coin}* | ${action}\nPrice: $${p.toLocaleString()}\nTP: $${tp.toLocaleString()} | SL: $${sl.toLocaleString()}\n\n`;
            aiData += `${coin}:${p} `;
        } catch (e) { continue; }
    }

    try {
        const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
        const aiRes = await axios.post(aiUrl, { contents: [{ parts: [{ text: `Act as a crypto whale. Give a short 2-line tactical summary for: ${aiData}` }] }] });
        report += `🤖 *AI INSIGHT:* _${aiRes.data.candidates[0].content.parts[0].text.trim()}_`;
    } catch (e) { report += "🤖 AI strategy updating..."; }

    return report + WATERMARK;
}

// --- COMMANDS ---
bot.onText(/\/ping/, (msg) => {
    send(msg.chat.id, "🛰️ *PASIYA-MD System Online*\n\nStatus: Active 24/7\nLatency: Ultra Low ⚡");
});

bot.onText(/\/news/, async (msg) => {
    const news = await fetchNews();
    send(msg.chat.id, news);
});

// --- AUTOMATIC TIMING ENGINE (Every 30 Minutes) ---
setInterval(async () => {
    console.log("Automatic scan started...");
    
    // 1. මුලින්ම නිවුස් යවනවා
    const newsMsg = await fetchNews();
    await send(config.channelId, newsMsg);

    // 2. විනාඩි 2කට පස්සේ 'Scanning' ඇලර්ට් එක
    setTimeout(async () => {
        await send(config.channelId, "🔍 *SYSTEM:* Starting deep analysis on 10 major coins...");
        
        // 3. තව තප්පර 15කින් සිග්නල් ටික
        setTimeout(async () => {
            const report = await getSignals();
            await send(config.channelId, report);
            console.log("Signals Published!");
        }, 15000);

    }, 120000); // 2 Minute delay after news

}, 30 * 60 * 1000); // Every 30 Mins

console.log("🚀 PASIYA-MD V4 Engine Started Successfully!");
