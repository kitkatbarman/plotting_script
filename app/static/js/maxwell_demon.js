const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;  // Fixed width
canvas.height = 400;  // Fixed height

let particles = [];
let animationFrameId;
let temp1 = 4;
let temp2 = 5;
let doorOpen = true;

const WALL_X = canvas.width / 2;
const DOOR_WIDTH = 5;
const DOOR_HEIGHT = 90;
const DOOR_Y = canvas.height / 2 - DOOR_HEIGHT / 2;

const NUM_PARTICLES = 20;  // Number of particles
const PARTICLE_SIZE = 15;  // Size of particles

let blueCountLeft = 0;
let blueCountRight = 0;
let redCountLeft = 0;
let redCountRight = 0;

const VICTORY_THRESHOLD = 9;

class Particle {
    constructor(x, y, temp, color) {
        this.x = x;
        this.y = y;
        this.temp = temp;
        this.color = color;
        this.vx = (Math.random() * 0.2 + 0.4) * this.temp * (Math.random() < 0.5 ? 1 : -1);  // Less variation in speed
        this.vy = (Math.random() * 0.2 + 0.4) * this.temp * (Math.random() < 0.5 ? 1 : -1);  // Less variation in speed
    }

    update() {
        this.vx += (Math.random() - 0.5) * 0.05; // Add small random deviation
        this.vy += (Math.random() - 0.5) * 0.05; // Add small random deviation

        this.x += this.vx;
        this.y += this.vy;

        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;

        // Check collision with the wall and door
        if (this.x >= WALL_X - PARTICLE_SIZE && this.x <= WALL_X + PARTICLE_SIZE) {
            if (this.y < DOOR_Y || this.y > DOOR_Y + DOOR_HEIGHT) {
                this.vx *= -1; // Reflect the particle if it's hitting the wall outside the door
                this.x = this.x < WALL_X ? WALL_X - PARTICLE_SIZE : WALL_X + PARTICLE_SIZE; // Adjust position to avoid sticking
            } else if (!doorOpen) {
                this.vx *= -1; // Reflect the particle if the door is closed
                this.x = this.x < WALL_X ? WALL_X - PARTICLE_SIZE : WALL_X + PARTICLE_SIZE; // Adjust position to avoid sticking
            }
        }

        // Ensure particle does not get stuck in the wall
        if (!doorOpen && this.x >= WALL_X - PARTICLE_SIZE && this.x <= WALL_X + PARTICLE_SIZE) {
            if (this.y >= DOOR_Y && this.y <= DOOR_Y + DOOR_HEIGHT) {
                if (this.x < WALL_X) {
                    this.x = WALL_X - PARTICLE_SIZE;
                } else {
                    this.x = WALL_X + PARTICLE_SIZE;
                }
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, PARTICLE_SIZE, 0, Math.PI * 2); // Use PARTICLE_SIZE for particle size
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const temp = i % 2 === 0 ? temp1 : temp2;
        const color = i % 2 === 0 ? 'blue' : 'red';
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, temp, color));
    }
}

function updateParticles() {
    blueCountLeft = 0;
    blueCountRight = 0;
    redCountLeft = 0;
    redCountRight = 0;

    particles.forEach(p => {
        p.update();
        if (p.color === 'blue') {
            if (p.x < WALL_X) {
                blueCountLeft++;
            } else {
                blueCountRight++;
            }
        } else {
            if (p.x < WALL_X) {
                redCountLeft++;
            } else {
                redCountRight++;
            }
        }
    });

    console.log(`Blue Right: ${blueCountRight}, Victory Threshold: ${VICTORY_THRESHOLD}`);

    // Check for victory condition
    if (blueCountLeft > VICTORY_THRESHOLD && redCountRight > VICTORY_THRESHOLD) {
        document.getElementById('victoryMessage').style.display = 'block';
        stopSimulation();
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background colors
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, WALL_X, canvas.height);
    ctx.fillStyle = 'lightcoral';
    ctx.fillRect(WALL_X, 0, WALL_X, canvas.height);

    // Draw the wall
    ctx.fillStyle = 'black';
    ctx.fillRect(WALL_X - 1, 0, 2, canvas.height);

    // Draw the door
    if (doorOpen) {
        ctx.clearRect(WALL_X - DOOR_WIDTH / 2, DOOR_Y, DOOR_WIDTH, DOOR_HEIGHT);
    } else {
        ctx.fillRect(WALL_X - DOOR_WIDTH / 2, DOOR_Y, DOOR_WIDTH, DOOR_HEIGHT);
    }

    particles.forEach(p => p.draw());

    // Draw counters
    ctx.fillStyle = 'blue';
    ctx.fillText(`Blue Left: ${blueCountLeft}`, 10, 20);
    ctx.fillText(`Blue Right: ${blueCountRight}`, canvas.width - 100, 20);
    ctx.fillStyle = 'red';
    ctx.fillText(`Red Left: ${redCountLeft}`, 10, 40);
    ctx.fillText(`Red Right: ${redCountRight}`, canvas.width - 100, 40);
}

function animate() {
    updateParticles();
    drawParticles();
    animationFrameId = requestAnimationFrame(animate);
}

function startSimulation() {
    document.getElementById('victoryMessage').style.display = 'none';
    if (!animationFrameId) {
        animate();
    }
}

function stopSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function resetSimulation() {
    stopSimulation();
    initParticles();
    drawParticles();
}

function updateTemperature(particleGroup, value) {
    if (particleGroup === 1) {
        temp1 = Math.min(value, temp2 - 0.1); // Ensure cold temp is always less than hot temp
    } else if (particleGroup === 2) {
        temp2 = Math.max(value, temp1 + 0.1); // Ensure hot temp is always more than cold temp
    }
    particles.forEach(p => {
        p.temp = p.color === 'blue' ? temp1 : temp2;
        p.vx = (Math.random() * 0.2 + 0.4) * p.temp * (Math.random() < 0.5 ? 1 : -1);  // Less variation in speed
        p.vy = (Math.random() * 0.2 + 0.4) * p.temp * (Math.random() < 0.5 ? 1 : -1);  // Less variation in speed
    });
    document.getElementById('temp1').value = temp1;
    document.getElementById('temp2').value = temp2;
}

function toggleDoor() {
    doorOpen = !doorOpen;
}

window.onload = () => {
    initParticles();
    drawParticles();
};
