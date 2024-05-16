// Function to check if a word is profane
const isProfane = (word) => {
    const lowerCaseWord = word.toLowerCase();
    return badWords.some(badWord => lowerCaseWord.includes(badWord));
};

document.getElementById('closeModal').onclick = function() {
    document.getElementById('highScoreModal').style.display = 'none';
};

document.getElementById('replayButton').onclick = function() {
    document.getElementById('highScoreModal').style.display = 'none';
    location.reload(); // Reload the page to restart the game
};

document.getElementById('submitNameButton').onclick = function() {
    const playerName = document.getElementById('playerNameInput').value;
    const score = parseInt(document.getElementById('playerNameInput').dataset.score, 10);
    if (playerName && !isProfane(playerName)) {
        submitScore(playerName, score);
    } else {
        alert('Please enter a valid name without offensive words.');
    }
};

function submitScore(name, score) {
    fetch('/submit_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, score: score }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score submitted successfully:', data);
        document.getElementById('nameInputPanel').style.display = 'none';
        fetchAllHighScores();
    })
    .catch((error) => {
        console.error('Error submitting score:', error);
    });
}

function fetchHighScores(callback) {
    fetch('/get_high_scores')
        .then(response => response.json())
        .then(data => {
            const highScoreList = document.getElementById('highScoreList');
            highScoreList.innerHTML = '';
            data.forEach((score, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${score[0]}</span><span>${score[1]}</span>`;
                if (index === 0) {
                    li.style.backgroundColor = 'gold';
                    li.style.fontSize = '1.4em';
                } else if (index === 1) {
                    li.style.backgroundColor = 'silver';
                    li.style.fontSize = '1.3em';
                } else if (index === 2) {
                    li.style.backgroundColor = '#cd7f32'; // Bronze color
                    li.style.fontSize = '1.2em';
                }
                highScoreList.appendChild(li);
            });
            document.getElementById('highScorePanel').style.display = 'block';
            if (callback) callback(data);
        })
        .catch(error => {
            console.error('Error fetching high scores:', error);
        });
}

function fetchAllHighScores() {
    fetchHighScores();
}

function checkIfHighScore(currentScore) {
    fetchHighScores((highScores) => {
        if (highScores.length < 10 || currentScore > highScores[highScores.length - 1][1]) {
            promptForName(currentScore);
        } else {
            showHighScores();
        }
    });
}

function promptForName(score) {
    const modal = document.getElementById('highScoreModal');
    const nameInputPanel = document.getElementById('nameInputPanel');
    const highScorePanel = document.getElementById('highScorePanel');
    const nameInput = document.getElementById('playerNameInput');

    nameInput.dataset.score = score;
    nameInputPanel.style.display = 'block';
    highScorePanel.style.display = 'none';
    modal.style.display = 'block';
}

function showHighScores() {
    const modal = document.getElementById('highScoreModal');
    const nameInputPanel = document.getElementById('nameInputPanel');
    const highScorePanel = document.getElementById('highScorePanel');

    nameInputPanel.style.display = 'none';
    highScorePanel.style.display = 'block';
    modal.style.display = 'block';

    fetchAllHighScores();
}
