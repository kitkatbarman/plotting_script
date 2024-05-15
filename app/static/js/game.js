// static/js/game.js
class Bullet {
    constructor(x, y, xSpeed, ySpeed) {
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.width = 20; // Bullet width
        this.height = 20; // Bullet height
    }

    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    hits(playerX, playerY, playerDiameter, playerColliderDiameter) {
        const playerRadius = playerColliderDiameter / 2;
        const playerCenterX = playerX + playerDiameter / 2;
        const playerCenterY = playerY + playerDiameter / 2;

        const bulletRadius = this.width / 2;
        const bulletCenterX = this.x + bulletRadius;
        const bulletCenterY = this.y + bulletRadius;

        const dx = playerCenterX - bulletCenterX;
        const dy = playerCenterY - bulletCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < playerRadius + bulletRadius;
    }

    isOffScreen() {
        return this.x < -this.width || this.x > 600 + this.width || this.y < -this.height || this.y > 600 + this.height;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.x = 300;
        this.y = 300;
        this.diameter = 50; // Player visual diameter
        this.colliderDiameter = 30; // Player collider diameter (smaller than visual diameter)
        this.speed = 5;
        this.keyStates = {};
        this.bullets = [];
        this.spawnDelay = 1000;
        this.speedIncreaseFactor = 1.2;
        this.difficultyIncreaseInterval = 3000;
        this.gameOver = false;
        this.currentScore = 0;
        this.highScore = 0;
        this.difficultyLevel = 1;

        this.touchCenterX = null;
        this.touchCenterY = null;
        this.touchMoveX = null;
        this.touchMoveY = null;

        document.addEventListener('keydown', (e) => this.keyStates[e.code] = true);
        document.addEventListener('keyup', (e) => this.keyStates[e.code] = false);

        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.resetTouch());

        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        this.moveTimer = setInterval(() => this.update(), 10);
        this.bulletTimer = setInterval(() => this.spawnBullet(), this.spawnDelay);
        this.difficultyTimer = setInterval(() => this.increaseDifficulty(), this.difficultyIncreaseInterval);

        // Initial draw
        this.draw();
    }

    handleTouchStart(e) {
        e.preventDefault(); // Prevent default touch actions
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchCenterX = touch.clientX - rect.left;
        this.touchCenterY = touch.clientY - rect.top;
    }

    handleTouchMove(e) {
        e.preventDefault(); // Prevent default touch actions
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchMoveX = touch.clientX - rect.left;
        this.touchMoveY = touch.clientY - rect.top;
    }

    resetTouch() {
        this.keyStates = {};
        this.touchCenterX = null;
        this.touchCenterY = null;
        this.touchMoveX = null;
        this.touchMoveY = null;
    }

    resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = 600 * ratio;
        this.canvas.height = 600 * ratio;
        this.ctx.scale(ratio, ratio);
        this.draw(); // Ensure to redraw after resizing
    }

    spawnBullet() {
        const side = Math.floor(Math.random() * 4);
        let xPos = 0, yPos = 0, xSpeed = 0, ySpeed = 0;
        let baseSpeed = 2 * this.speedIncreaseFactor;

        switch (side) {
            case 0: // from top
                xPos = Math.random() * 600;
                yPos = -20;
                ySpeed = baseSpeed;
                break;
            case 1: // from bottom
                xPos = Math.random() * 600;
                yPos = 600;
                ySpeed = -baseSpeed;
                break;
            case 2: // from left
                xPos = -20;
                yPos = Math.random() * 600;
                xSpeed = baseSpeed;
                break;
            case 3: // from right
                xPos = 600;
                yPos = Math.random() * 600;
                xSpeed = -baseSpeed;
                break;
        }
        this.bullets.push(new Bullet(xPos, yPos, xSpeed, ySpeed));
    }

    update() {
        if (!this.gameOver) {
            this.handlePlayerMovement();
            this.handleTouchMovement();
            this.bullets.forEach((bullet, index) => {
                bullet.move();
                if (bullet.hits(this.x, this.y, this.diameter, this.colliderDiameter)) {
                    this.gameOver = true;
                    this.handleGameOver();
                }
                if (bullet.isOffScreen()) {
                    this.bullets.splice(index, 1);
                    this.currentScore++;
                }
            });
            this.draw();
        }
    }

    handlePlayerMovement() {
        if (this.keyStates['KeyW']) this.y = Math.max(0, this.y - this.speed);
        if (this.keyStates['KeyS']) this.y = Math.min(600 - this.diameter, this.y + this.speed);
        if (this.keyStates['KeyA']) this.x = Math.max(0, this.x - this.speed);
        if (this.keyStates['KeyD']) this.x = Math.min(600 - this.diameter, this.x + this.speed);
    }

    handleTouchMovement() {
        if (this.touchCenterX !== null && this.touchMoveX !== null) {
            const dx = this.touchMoveX - this.touchCenterX;
            const dy = this.touchMoveY - this.touchCenterY;

            this.x += dx * 0.1; // Adjust the multiplier for sensitivity
            this.y += dy * 0.1;

            // Update the touch center to prevent jumping
            this.touchCenterX = this.touchMoveX;
            this.touchCenterY = this.touchMoveY;

            // Ensure the player stays within the canvas bounds
            this.x = Math.max(0, Math.min(600 - this.diameter, this.x));
            this.y = Math.max(0, Math.min(600 - this.diameter, this.y));
        }
    }

    handleGameOver() {
        clearInterval(this.moveTimer);
        clearInterval(this.bulletTimer);
        clearInterval(this.difficultyTimer);
        this.updateHighScore();
        alert(`Game Over!\nYour Score: ${this.currentScore}\nHigh Score: ${this.highScore}`);
        if (confirm('Replay?')) {
            this.restartGame();
        } else {
            window.location.href = '/';
        }
    }

    increaseDifficulty() {
        this.spawnDelay = Math.max(100, this.spawnDelay - 50);
        clearInterval(this.bulletTimer);
        this.bulletTimer = setInterval(() => this.spawnBullet(), this.spawnDelay);

        this.speedIncreaseFactor += 0.1;
        this.difficultyLevel++;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio); // Clear the canvas
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.ellipse(this.x + this.diameter / 2, this.y + this.diameter / 2, this.diameter / 2, this.diameter / 2, 0, 0, 2 * Math.PI);
        this.ctx.fill();

        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.currentScore}`, 20, 30);
        this.ctx.fillText(`High Score: ${this.highScore}`, 20, 60);
        this.ctx.fillText(`Level: ${this.difficultyLevel}`, 20, 90);
    }

    updateHighScore() {
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
        }
    }

    restartGame() {
        this.spawnDelay = 1000;
        this.speedIncreaseFactor = 1.0;
        clearInterval(this.bulletTimer);
        this.bulletTimer = setInterval(() => this.spawnBullet(), this.spawnDelay);
        this.x = 300;
        this.y = 300;
        this.bullets = [];
        this.gameOver = false;
        this.currentScore = 0;
        this.keyStates = {};
        this.moveTimer = setInterval(() => this.update(), 10);
        this.difficultyTimer = setInterval(() => this.increaseDifficulty(), this.difficultyIncreaseInterval);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.draw(); // Initial draw
});
