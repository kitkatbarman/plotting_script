let selectedButton = null;
let selectedDifficulty = null;

const EASY = { MIN_CIRCLE_SIZE: 100, MAX_CIRCLE_SIZE: 150, spawnInterval: 1000, growTime: 2000, fadeTime: 3000, scoreScaler: 0.25 };
const MEDIUM = { MIN_CIRCLE_SIZE: 70, MAX_CIRCLE_SIZE: 120, spawnInterval: 700, growTime: 1500, fadeTime: 1200, scoreScaler: 1 };
const HARD = { MIN_CIRCLE_SIZE: 20, MAX_CIRCLE_SIZE: 70, spawnInterval: 500, growTime: 1000, fadeTime: 1000, scoreScaler: 1.75 };
const INSANE = { MIN_CIRCLE_SIZE: 10, MAX_CIRCLE_SIZE: 40, spawnInterval: 250, growTime: 1000, fadeTime: 800, scoreScaler: 3 };

let difficulty = EASY;
let spawnInterval = difficulty.spawnInterval;
let growTime = difficulty.growTime;
let fadeTime = difficulty.fadeTime;
let scoreScaler = difficulty.scoreScaler;
let MIN_CIRCLE_SIZE = difficulty.MIN_CIRCLE_SIZE;
let MAX_CIRCLE_SIZE = difficulty.MAX_CIRCLE_SIZE;

class Circle {
    constructor(x, y, maxSize, growTime, fadeTime) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.initialSize = maxSize; // Store the initial size
        this.maxSize = maxSize;
        this.growTime = growTime;
        this.fadeTime = fadeTime;
        this.startTime = Date.now();
        this.state = 'growing'; // possible states: 'growing', 'fading'
    }

    update() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;

        if (this.state === 'growing') {
            const progress = elapsedTime / this.growTime;
            this.size = progress * this.maxSize;
            if (progress >= 1) {
                this.state = 'fading';
                this.startTime = currentTime;
            }
        } else if (this.state === 'fading') {
            const progress = elapsedTime / this.fadeTime;
            this.size = this.maxSize * (1 - progress);
            if (progress >= 1) {
                this.size = 0;
                this.state = 'done';
            }
        }
    }

    draw(context) {
        if (this.state !== 'done') {
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            context.fillStyle = `rgba(0, 150, 255, ${this.getOpacity()})`;
            context.fill();
            context.restore();
        }
    }

    getOpacity() {
        if (this.state === 'growing') {
            return 1;
        } else if (this.state === 'fading') {
            const currentTime = Date.now();
            const elapsedTime = currentTime - this.startTime;
            const progress = elapsedTime / this.fadeTime;
            return 1 - progress;
        }
        return 0;
    }

    isDone() {
        return this.state === 'done';
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= (this.size / 2) * (this.size / 2);
    }
}

class PopupText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.startTime = Date.now();
        this.duration = 1000; // 1 second
        this.opacity = 1;
    }

    update() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        const progress = elapsedTime / this.duration;
        this.y -= 0.5; // Move upwards
        this.opacity = 1 - progress;
        if (progress >= 1) {
            this.opacity = 0;
        }
    }

    draw(context) {
        if (this.opacity > 0) {
            context.save();
            context.font = '15px Arial';
            context.strokeStyle = 'black'; // Black border
            context.lineWidth = 2;

            // Measure text width and height
            const textMetrics = context.measureText(this.text);
            const textWidth = textMetrics.width;
            const textHeight = 20; // Approximate text height

            // Adjust position to stay within canvas boundaries
            let drawX = this.x;
            let drawY = this.y;
            if (drawX - textWidth / 2 < 0) drawX = textWidth / 2;
            if (drawX + textWidth / 2 > canvas.width) drawX = canvas.width - textWidth / 2;
            if (drawY - textHeight < 0) drawY = textHeight;
            if (drawY + textHeight > canvas.height) drawY = canvas.height - textHeight;

            context.strokeText(this.text, drawX - textWidth / 2, drawY); // Draw border
            context.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            context.fillText(this.text, drawX - textWidth / 2, drawY); // Draw text
            context.restore();
        }
    }

    isDone() {
        return this.opacity <= 0;
    }
}

let circles = [];
let popups = [];
const canvas = document.getElementById('circlesCanvas');
const context = canvas.getContext('2d');

const framePadding = 0; // Padding for the frame
let frame = {
    x: framePadding,
    y: framePadding,
    width: 800 - 2 * framePadding,
    height: 600 - 2 * framePadding
};

let score = 0;
let timer = 20;
let intervalId;
let circleIntervalId;
let gameRunning = false;

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    frame.width = 800 - 2 * framePadding;
    frame.height = 600 - 2 * framePadding;
}

function addCircle() {
    if (gameRunning) {
        const x = Math.random() * frame.width + frame.x;
        const y = Math.random() * frame.height + frame.y;
        const maxSize = Math.random() * (MAX_CIRCLE_SIZE - MIN_CIRCLE_SIZE) + MIN_CIRCLE_SIZE; // Random size between MIN_CIRCLE_SIZE and MAX_CIRCLE_SIZE
        circles.push(new Circle(x, y, maxSize, growTime, fadeTime));
    }
}

function updateAndDraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, frame.y);
    context.fillRect(0, frame.y, frame.x, frame.height);
    context.fillRect(frame.x + frame.width, frame.y, canvas.width - (frame.x + frame.width), frame.height);
    context.fillRect(0, frame.y + frame.height, canvas.width, canvas.height - (frame.y + frame.height));
    
    context.strokeStyle = 'rgba(0, 0, 0, 1)';
    context.lineWidth = 1;
    context.strokeRect(frame.x, frame.y, frame.width, frame.height);
    
    context.save();
    context.beginPath();
    context.rect(frame.x, frame.y, frame.width, frame.height);
    context.clip();
    
    circles = circles.filter(circle => !circle.isDone());
    circles.forEach(circle => {
        circle.update();
        circle.draw(context);
    });

    popups = popups.filter(popup => !popup.isDone());
    popups.forEach(popup => {
        popup.update();
        popup.draw(context);
    });
    
    context.restore();
    
    if (gameRunning) {
        requestAnimationFrame(updateAndDraw);
    }
}

canvas.addEventListener('click', function(event) {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let hit = false;
    circles = circles.filter(circle => {
        if (circle.containsPoint(x, y)) {
            hit = true;
            const circleScore = ((MAX_CIRCLE_SIZE - circle.initialSize) / (MAX_CIRCLE_SIZE - MIN_CIRCLE_SIZE) * 9 + 1).toFixed(2); // Calculate score
            score += parseFloat(circleScore) * scoreScaler;
            popups.push(new PopupText(x, y, `+${(circleScore * scoreScaler).toFixed(2)}`, '0, 255, 0')); // Green for added points
            return false;
        }
        return true;
    });

    if (!hit) {
        score -= 3;
        popups.push(new PopupText(x, y, '-3.00', '255, 0, 0')); // Red for subtracted points
    }

    document.getElementById('score').textContent = `Score: ${score.toFixed(2)}`;
});

function startGame() {
    document.getElementById('game-rules').style.display = 'none';
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    score = 0;
    timer = 20;
    gameRunning = true;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('time').textContent = `Time: ${timer.toFixed(2)}`;

    // Clear all circles
    circles = [];
    popups = [];

    if (intervalId) clearInterval(intervalId);
    if (circleIntervalId) clearInterval(circleIntervalId);

    intervalId = setInterval(() => {
        timer -= 0.01;
        document.getElementById('time').textContent = `Time: ${timer.toFixed(2)}`;
        if (timer <= 0) {
            clearInterval(intervalId);
            clearInterval(circleIntervalId);
            gameRunning = false;
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('final-score').textContent = `Your final score is ${score.toFixed(2)}`;
        }
    }, 10);

    circleIntervalId = setInterval(addCircle, spawnInterval);
    updateAndDraw();
}


function retryGame() {
    document.getElementById('game-over').style.display = 'none';
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    startGame();
}

function selectDifficulty(difficulty, event) {
    selectedDifficulty = difficulty;
    
    // Remove the 'selected' class from all difficulty buttons
    const buttons = document.querySelectorAll('.difficulty-button');
    buttons.forEach(button => button.classList.remove('selected'));

    // Add the 'selected' class to the clicked button
    event.target.classList.add('selected');
    
    selectedButton = event.target;
    
    difficulty = selectedDifficulty;

    switch (difficulty) {
        case 'EASY':
            MIN_CIRCLE_SIZE = EASY.MIN_CIRCLE_SIZE;
            MAX_CIRCLE_SIZE = EASY.MAX_CIRCLE_SIZE;
            spawnInterval = EASY.spawnInterval;
            growTime = EASY.growTime;
            fadeTime = EASY.fadeTime;
            scoreScaler = EASY.scoreScaler;
            break;
        case 'MEDIUM':
            MIN_CIRCLE_SIZE = MEDIUM.MIN_CIRCLE_SIZE;
            MAX_CIRCLE_SIZE = MEDIUM.MAX_CIRCLE_SIZE;
            spawnInterval = MEDIUM.spawnInterval;
            growTime = MEDIUM.growTime;
            fadeTime = MEDIUM.fadeTime;
            scoreScaler = MEDIUM.scoreScaler;
            break;
        case 'HARD':
            MIN_CIRCLE_SIZE = HARD.MIN_CIRCLE_SIZE;
            MAX_CIRCLE_SIZE = HARD.MAX_CIRCLE_SIZE;
            spawnInterval = HARD.spawnInterval;
            growTime = HARD.growTime;
            fadeTime = HARD.fadeTime;
            scoreScaler = HARD.scoreScaler;
            break;
        case 'INSANE':
            MIN_CIRCLE_SIZE = INSANE.MIN_CIRCLE_SIZE;
            MAX_CIRCLE_SIZE = INSANE.MAX_CIRCLE_SIZE;
            spawnInterval = INSANE.spawnInterval;
            growTime = INSANE.growTime;
            fadeTime = INSANE.fadeTime;
            scoreScaler = INSANE.scoreScaler;
            break;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateAndDraw();
