export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    // FIX: Vercel might have already parsed req.body. Check before parsing!
    let topic;
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        topic = body.topic;
    } catch (e) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const KEY = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate 5 multiple choice questions about ${topic}. 
                        Return ONLY a JSON array. 
                        Each object: {"question": "...", "options": ["a", "b", "c", "d"], "answer": "the exact string from options"}. 
                        Do not include markdown tags like \`\`\`json or any other text.`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        // Safety check for AI response
        if (!data.candidates || !data.candidates[0]) {
            throw new Error("AI failed to respond");
        }

        let rawText = data.candidates[0].content.parts[0].text;
        
        // Final Cleanup: AI sometimes adds ```json ... ``` even when told not to
        const cleanJson = rawText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Failed to generate quiz", details: error.message });
    }
}
