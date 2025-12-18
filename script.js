let quizData = [];
let currentIdx = 0;
let score = 0;

async function startQuiz() {
    const key = document.getElementById('api-key').value;
    const topic = document.getElementById('topic').value;

    if (!key || !topic) return alert("Please enter both API Key and Topic!");

    // UI Transitions
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate 5 multiple choice questions about ${topic}. 
                        Return ONLY a JSON array. Each object: {"question": "...", "options": ["a", "b", "c", "d"], "answer": "correct string"}. 
                        No markdown, no explainers.`
                    }]
                }]
            })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        quizData = JSON.parse(text);

        document.getElementById('loader').classList.add('hidden');
        document.getElementById('question-container').classList.remove('hidden');
        displayQuestion();
        
    } catch (err) {
        alert("Failed to load quiz. Check your API key or Topic!");
        location.reload(); 
    }
}

function displayQuestion() {
    const q = quizData[currentIdx];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('current-num').innerText = currentIdx + 1;
    
    const list = document.getElementById('options-list');
    list.innerHTML = "";
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "option-btn";
        btn.onclick = () => handleChoice(opt);
        list.appendChild(btn);
    });
}

function handleChoice(selected) {
    if (selected === quizData[currentIdx].answer) {
        score++;
        document.getElementById('score-count').innerText = score;
    }
    
    currentIdx++;
    if (currentIdx < quizData.length) {
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    document.getElementById('question-container').innerHTML = `
        <h2>Quiz Complete! 🏆</h2>
        <p>You scored ${score} out of ${quizData.length}</p>
        <button onclick="location.reload()">Try Again</button>
    `;
}