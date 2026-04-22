const axios = require('axios');

// --- ⚙️ CONFIGURATION ---
const config = {
    token: '8372538783:AAEWx9WApRSbvmnEfEByeEftS1iVBYvm6fg',
    myChatId: '8143587403',
    channelId: '-1003910635197',
    geminiKey: 'AIzaSyD26yJiilp8SvIvutDmGW1p_bu0pLbpq48'
};

const WATERMARK = "\n\n🛡️ *Powered by PASIYA-MD*";

// --- 🛠️ HELPER FUNCTIONS ---
async function sendMessage(id, text) {
    const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
    try {
        await axios.post(url, { 
            chat_id: id, 
            text: text, 
            parse_mode: "Markdown", 
            disable_web_page_preview: true 
        });
    } catch (e) { console.log("Telegram Error:", e.message); }
}

async function getNews() {
    try {
        const res = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&limit=3');
        let text = "📰 *LATEST CRYPTO NEWS:*\n";
        res.data.Data.forEach(n => {
            text += `• [${n.title.substring(0, 50)}...](${n.url})\n`;
        });
        return text;
    } catch (e) { return "📰 News syncing..."; }
}

async function getSignals() {
    const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
    let text = "🎯 *PREMIUM SIGNALS:*\n";
    let aiContext = "";

    for (const coin of coins) {
        try {
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const p = parseFloat(res.data.lastPrice);
            const c = parseFloat(res.data.priceChangePercent);
            
            const isLong = c > 0;
            const action = isLong ? "LONG 📈" : "SHORT 📉";
            const tp = isLong ? p * 1.015 : p * 0.985;
            const sl = isLong ? p * 0.982 : p * 1.018;

            text += `🔹 *${coin}* | ${action}\nPrice: $${p.toLocaleString()} | SL: $${sl.toLocaleString()}\nTP: $${tp.toLocaleString()}\n\n`;
            aiContext += `${coin}:${p} `;
        } catch (e) { continue; }
    }
    return { text, aiContext };
}

async function getAI(data) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
        const res = await axios.post(url, { contents: [{ parts: [{ text: `Act as a crypto whale pro. Tactical advice for: ${data}. 2 lines only.` }] }] });
        return `🤖 *AI STRATEGY:* _${res.data.candidates[0].content.parts[0].text.trim()}_`;
    } catch (e) { return "🤖 AI analyzing..."; }
}

// --- 🚀 MAIN ENGINE ---
async function startWorkflow() {
    // 1. බොට් ඇක්ටිව් මැසේජ් එක (Startup)
    console.log("🚀 System Booting...");
    await sendMessage(config.myChatId, "✅ *PASIYA-CRYPTO SYSTEM ACTIVE* \nInitializing professional market scan..." + WATERMARK);

    // 2. Pre-Signal Alert
    const alert = `🔔 *PRE-SIGNAL ALERT* \n\nFetching market depth and liquidity. Premium signals arriving in 15 seconds! ⚡` + WATERMARK;
    await sendMessage(config.myChatId, alert);
    await sendMessage(config.channelId, alert);
    
    console.log("⏳ Waiting for data sync...");
    await new Promise(r => setTimeout(r, 15000)); // 15s Delay

    // 3. Build Full Report (Signals + News + AI)
    const newsSection = await getNews();
    const signalData = await getSignals();
    const aiSection = await getAI(signalData.aiContext);

    const fullReport = `💎 *PASIYA-CRYPTO PREMIUM V3* 💎\n\n` + 
                       `${newsSection}\n\n` + 
                       `${signalData.text}\n` + 
                       `${aiSection}` + 
                       WATERMARK;

    // 4. Send Full Report
    await sendMessage(config.myChatId, fullReport);
    await sendMessage(config.channelId, fullReport);
    
    console.log("✅ Next Level Report Published!");
}

startWorkflow();
