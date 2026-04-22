const axios = require('axios');

const config = {
    token: '8372538783:AAEWx9WApRSbvmnEfEByeEftS1iVBYvm6fg',
    myChatId: '8143587403',
    channelId: '-1003910635197',
    geminiKey: 'AIzaSyD26yJiilp8SvIvutDmGW1p_bu0pLbpq48'
};

async function getMarketReport() {
    const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];
    let report = `💎 *PASIYA-CRYPTO PREMIUM* 💎\n\n🎯 *SIGNALS:*\n`;
    let aiData = "";

    for (const coin of coins) {
        try {
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const p = parseFloat(res.data.lastPrice);
            const c = parseFloat(res.data.priceChangePercent);
            const action = c > 0 ? "LONG 📈" : "SHORT 📉";
            const tp = c > 0 ? p * 1.015 : p * 0.985;
            const sl = c > 0 ? p * 0.98 : p * 1.02;

            report += `🔹 *${coin}* | ${action}\nPrice: $${p.toLocaleString()} | SL: $${sl.toLocaleString()}\nTP: $${tp.toLocaleString()}\n\n`;
            aiData += `${coin}:${p} `;
        } catch (e) { continue; }
    }

    try {
        const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiKey}`;
        const aiRes = await axios.post(aiUrl, { contents: [{ parts: [{ text: `Crypto tactical advice for: ${aiData}` }] }] });
        report += `🤖 *AI:* _${aiRes.data.candidates[0].content.parts[0].text.trim()}_`;
    } catch (e) { report += "🤖 AI strategy updating..."; }

    return report + "\n\n🛡️ *Powered by PASIYA-MD*";
}

async function sendToTelegram() {
    const report = await getMarketReport();
    const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
    
    try {
        await axios.post(url, { chat_id: config.myChatId, text: report, parse_mode: "Markdown", disable_web_page_preview: true });
        await axios.post(url, { chat_id: config.channelId, text: report, parse_mode: "Markdown", disable_web_page_preview: true });
        console.log("✅ Signals Published Successfully!");
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
}

sendToTelegram();
