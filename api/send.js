module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { date, time, activity } = req.body;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return res.status(500).json({ error: 'Telegram credentials are not configured on Vercel.' });
        }

        // Format date nicely (DD.MM.YYYY)
        let formattedDate = date;
        if (date) {
            const dateParts = date.split('-');
            if (dateParts.length === 3) {
                formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
            }
        }

        const messageText = `🌹 *Gülom Date Teklifini Kabul Etti!* 🌹\n\n📅 *Tarih:* ${formattedDate}\n🕒 *Saat:* ${time}\n🗺️ *Plan:* ${activity}\n\nSözleştiğiniz gibi orada olacak! 😉`;

        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const telegramResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });

        if (telegramResponse.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errData = await telegramResponse.json();
            return res.status(500).json({ error: 'Telegram API returned an error', details: errData });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
