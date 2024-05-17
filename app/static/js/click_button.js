let score = 0;
let timer = 30; // Game duration in seconds
let spawnInterval = 1500; // Initial spawn interval in milliseconds
let itemDuration = 2000; // Initial item duration in milliseconds
let intervalId;
let spawnTimeoutId;

function startGame() {
    score = 0;
    timer = 60;
    spawnInterval = 2000;
    itemDuration = 1500;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timer;
    intervalId = setInterval(updateTimer, 1000);
    spawnItem();
}

function updateTimer() {
    timer--;
    document.getElementById('timer').textContent = timer;
    if (timer <= 0) {
        clearInterval(intervalId);
        clearTimeout(spawnTimeoutId);
        document.getElementById('try-again-button').style.display = 'block';
    }
}

function spawnItem() {
    const item = document.createElement('div');
    item.className = 'collectable-item';
    item.onclick = collectItem;
    document.getElementById('game-area').appendChild(item);
    positionItem(item);

    setTimeout(() => {
        fadeOut(item, () => item.remove());
    }, itemDuration);

    // Schedule the next item to spawn
    spawnTimeoutId = setTimeout(spawnItem, spawnInterval);

    // Decrease item duration and spawn interval over time
    itemDuration = Math.max(500, itemDuration - 50);
    spawnInterval = Math.max(400, spawnInterval - 50);
}

function positionItem(item) {
    const container = document.getElementById('game-area');
    const maxX = container.clientWidth - item.offsetWidth;
    const maxY = container.clientHeight - item.offsetHeight;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    item.style.left = randomX + 'px';
    item.style.top = randomY + 'px';
}

function collectItem(event) {
    score++;
    document.getElementById('score').textContent = score;
    fadeOut(event.target, () => event.target.remove());
}

function fadeOut(element, callback) {
    element.style.transition = 'opacity 0.5s';
    element.style.opacity = '0';
    setTimeout(() => {
        if (callback) callback();
    }, 500);
}

function resetGame() {
    document.getElementById('try-again-button').style.display = 'none';
    document.querySelectorAll('.collectable-item').forEach(item => item.remove());
    startGame();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('try-again-button').onclick = resetGame;
    startGame();
});
