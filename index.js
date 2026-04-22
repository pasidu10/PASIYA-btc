const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const config = {
    token: '8372538783:AAEWx9WApRSbvmnEfEByeEftS1iVBYvm6fg',
    myChatId: '8143587403',
    channelId: '-1003910635197',
    geminiKey: 'AIzaSyD26yJiilp8SvIvutDmGW1p_bu0pLbpq48'
};

const bot = new TelegramBot(config.token, { polling: true });
const WATERMARK = "\n\n🛡️ *Powered by PASIYA-MD*";

// --- 🛠️ FUNCTIONS ---

async function send(id, text) {
    try { await bot.sendMessage(id, text, { parse_mode: "Markdown", disable_web_page_preview: true }); } 
    catch (e) { console.log("Error sending:", e.message); }
}

async function fetchNews() {
    try {
        const res = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=5');
        let text = "🚀 *PASIYA-MD FLASH NEWS* 🚀\n\n";
        res.data.Data.forEach(n => text += `📍 [${n.title}](${n.url})\n\n`);
        return text + WATERMARK;
    } catch (e) { return "❌ News update failed."; }
}

async function generateSignals() {
    const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT'];
    let report = `💎 *PASIYA-CRYPTO PREMIUM ANALYSIS* 💎\n\n`;
    let aiContext = "";

    for (const coin of coins) {
        try {
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const p = parseFloat(res.data.lastPrice);
            const c = parseFloat(res.data.priceChangePercent);
            const action = c > 0 ? "LONG 📈" : "SHORT 📉";
            const tp = c > 0 ? p * 1.015 : p * 0.985;
            const sl = c > 0 ? p * 0.98 : p * 1.02;

            report += `🔸 *${coin}* | ${action}\nPrice: $${p.toLocaleString()} | SL: $${sl.toLocaleString()}\nTP: $${tp.toLocaleString()}\n\n`;
            aiContext += `${coin}:${p} `;
        } catch (e) { continue; }
    }

    try {
        const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
        const aiRes = await axios.post(aiUrl, { contents: [{ parts: [{ text: `Crypto expert analysis for: ${aiContext}. Give 3-line bull/bear sentiment.` }] }] });
        report += `🤖 *AI INSIGHT:* _${aiRes.data.candidates[0].content.parts[0].text.trim()}_`;
    } catch (e) { report += "🤖 AI thinking..."; }

    return report + WATERMARK;
}

// --- 🤖 COMMAND HANDLERS ---
bot.onText(/\/ping/, (msg) => {
    if (msg.chat.id.toString() === config.myChatId) {
        bot.sendMessage(msg.chat.id, "🛰️ *PASIYA-MD System Online*\nLatency: Low\nStatus: Scanning Market...", { parse_mode: "Markdown" });
    }
});

bot.onText(/\/news/, async (msg) => {
    const news = await fetchNews();
    bot.sendMessage(msg.chat.id, news, { parse_mode: "Markdown", disable_web_page_preview: true });
});

// --- 🚀 MAIN ENGINE ---
async function runSystem() {
    console.log("🛠️ Starting Next-Gen Workflow...");

    // 1. News Update (සිග්නල් වලට විනාඩි 15කට කලින් වගේ)
    const newsMsg = await fetchNews();
    await send(config.myChatId, newsMsg);
    await send(config.channelId, newsMsg);

    await new Promise(r => setTimeout(r, 10000)); // පොඩි විවේකයක්

    // 2. Start Analysis Alert
    await send(config.myChatId, "🔍 *SYSTEM:* Starting Deep Scan on 10 major assets...");
    await new Promise(r => setTimeout(r, 5000));

    // 3. Pre-Signal Alert
    const alert = `🔔 *PRE-SIGNAL ALERT* \n\nAnalysis finalized for 10 coins. Premium report ready in 10 seconds! ⚡` + WATERMARK;
    await send(config.myChatId, alert);
    await send(config.channelId, alert);
    
    await new Promise(r => setTimeout(r, 10000));

    // 4. Send Full Report
    const report = await generateSignals();
    await send(config.myChatId, report);
    await send(config.channelId, report);
    
    console.log("✅ All tasks complete. System standing by.");
    
    // GitHub Actions එක ඉවර වෙන්න කලින් පොඩ්ඩක් ඉන්න දෙනවා කමාන්ඩ්ස් වැඩ කරන්න
    setTimeout(() => { process.exit(0); }, 60000); 
}

runSystem();
