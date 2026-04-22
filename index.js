const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// --- SETTINGS ---
const token = '8372538783:AAEWx9WApRSbvmnEfEByeEftS1iVBYvm6fg';
const chatId = '8143587403';
const GEMINI_API_KEY = 'AIzaSyD26yJiilp8SvIvutDmGW1p_bu0pLbpq48'; 

const bot = new TelegramBot(token, {polling: true});
const WATERMARK = "\n\n🛡️ *Powered by PASIYA-CRYPTO-AI*";

// 1. Gemini AI Analysis Function
async function getAIAnalysis(marketData) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `Act as a crypto trading expert. Based on this 24h market data, give a brief 2-3 line summary in English about the current market sentiment (Bullish/Bearish) and a tip for traders: ${marketData}`;
        
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "⚠️ AI Analysis currently unavailable.";
    }
}

// 2. Signal Generation (10 Coins - 10 Signals/Factors each)
async function generateSignals() {
    const coins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    let report = "📊 *PASIYA-CRYPTO AI SIGNAL REPORT*\n\n";
    let dataForAI = "";

    for (let coin of coins) {
        try {
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const price = parseFloat(res.data.lastPrice);
            const change = parseFloat(res.data.priceChangePercent);
            const high = parseFloat(res.data.highPrice);
            const low = parseFloat(res.data.lowPrice);
            
            // Logic for 100% Signal Score (Based on Volatility and Change)
            let score = 50 + (change * 5); 
            if (score > 100) score = 100;
            if (score < 0) score = 0;

            let emoji = score > 60 ? "🟢" : (score < 40 ? "🔴" : "🟡");
            let action = score > 60 ? "BUY" : (score < 40 ? "SELL" : "HOLD");

            report += `${emoji} *${coin}*\n💰 Price: $${price.toLocaleString()}\n⚡ Signal Score: ${score.toFixed(1)}%\n🎯 Action: *${action}*\n📈 24h High: $${high.toLocaleString()}\n📉 24h Low: $${low.toLocaleString()}\n\n`;
            
            dataForAI += `${coin} is at $${price} (${change}% change). `;
        } catch (e) { continue; }
    }

    report += "🤖 *Gemini AI Market Summary:*\n";
    const aiSummary = await getAIAnalysis(dataForAI);
    report += "_" + aiSummary.trim() + "_" + WATERMARK;
    
    return report;
}

// --- COMMANDS ---

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(chatId, "🚀 *PASIYA-CRYPTO-AI PRO ACTIVE*\n\nඔයාට පුළුවන් පහත Commands පාවිච්චි කරන්න:\n\n/signals - Get AI Analysis for Top 10 Coins\n/price [coin] - Get Instant Price", {parse_mode: "Markdown"});
});

bot.onText(/\/signals/, async (msg) => {
    const loadingMsg = await bot.sendMessage(chatId, "🔍 PASIYA-AI කොයින් 10ක් ඇනලයිස් කරමින් පවතී... විනාඩියක් ඉන්න.");
    const report = await generateSignals();
    bot.deleteMessage(chatId, loadingMsg.message_id);
    bot.sendMessage(chatId, report, {parse_mode: "Markdown"});
});

bot.onText(/\/price (.+)/, async (msg, match) => {
    const coin = match[1].toUpperCase();
    try {
        const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
        const price = parseFloat(res.data.price).toLocaleString();
        bot.sendMessage(chatId, `🪙 *${coin}/USDT*\n💵 *Price:* $${price}${WATERMARK}`, {parse_mode: "Markdown"});
    } catch (e) {
        bot.sendMessage(chatId, "❌ ඔය Coin එක හොයාගන්න බැහැ මචං.");
    }
});

console.log("PASIYA-CRYPTO-AI System Started Successfully!");
