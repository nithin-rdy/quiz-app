export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    // Safe body parsing
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
                        Each object must have: "question", "options" (array of 4 strings), and "answer" (exact string from options). 
                        No markdown, no backticks, no text before or after the JSON.`
                    }]
                }],
                // Force safety filters to allow more topics
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.error("Gemini Error:", data);
            throw new Error("AI failed to respond. Check safety settings or quota.");
        }

        let rawText = data.candidates[0].content.parts[0].text;
        
        // Powerful cleanup to find the JSON array
        const start = rawText.indexOf('[');
        const end = rawText.lastIndexOf(']') + 1;
        if (start === -1 || end === 0) throw new Error("AI did not return valid JSON");
        
        const cleanJson = JSON.parse(rawText.substring(start, end));
        res.status(200).json(cleanJson);

    } catch (error) {
        console.error("Backend Crash:", error.message);
        res.status(500).json({ error: "Failed to generate quiz", details: error.message });
    }
}
