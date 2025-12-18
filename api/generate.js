export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    const { topic } = JSON.parse(req.body);
    const KEY = process.env.GEMINI_API_KEY; // Hidden on Vercel's server

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate 5 multiple choice questions about ${topic}. Return ONLY a JSON array of objects. Each object must have "question", "options" (array of 4 strings), and "answer" (the correct string). Do not include markdown code blocks.`
                    }]
                }]
            })
        });

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        
        // Return the quiz to your frontend
        res.status(200).json(JSON.parse(rawText));
    } catch (error) {
        res.status(500).json({ error: "Failed to generate quiz" });
    }
}