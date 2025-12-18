let quizData = [];
let currentIdx = 0;
let score = 0;

async function startQuiz() {
    const topic = document.getElementById('topic').value;

    if (!topic) return alert("Please enter a Topic!");

    // UI Transitions
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');

    try {
        // We call our OWN backend here, which holds the secret key!
        const response = await fetch('/api/generate', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();
        
        // Check if the backend sent an error
        if (data.error) {
            throw new Error(data.error);
        }

        quizData = data; // Our backend already cleaned the data for us

        document.getElementById('loader').classList.add('hidden');
        document.getElementById('question-container').classList.remove('hidden');
        displayQuestion();
        
    } catch (err) {
        console.error(err);
        alert("AI is busy or topic was blocked. Try a different topic!");
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
