let canvas;
let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let scale = 1.0;
let translateX = 0;
let translateY = 0;
let baseStepSize = 50;
let useFractalStepSize = false;
let fractalSteps = 30;
let fractalStepCounter = 0;
let stepCount = 0;
let barriers = [];
let randomnessLevel = 0;
let timer;
let followWalk = false;
let lineThickness = 2;

function setup() {
    canvas = createCanvas(800, 800);
    canvas.parent('canvas-container');
    canvas.elt.style.touchAction = 'none';
    pathPoints.push({ x: currentLocation.x, y: currentLocation.y });
    frameRate(10); // Start with a default speed

    // Mouse wheel zoom
    canvas.elt.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? 1.1 : 0.9;
        scale *= delta;

        let mouseX = e.offsetX;
        let mouseY = e.offsetY;

        translateX = mouseX - delta * (mouseX - translateX);
        translateY = mouseY - delta * (mouseY - translateY);
    });

    // Touch pinch zoom
    canvas.elt.addEventListener('touchmove', (e) => {
        if (e.touches.length == 2) {
            e.preventDefault();
            let dx = e.touches[0].pageX - e.touches[1].pageX;
            let dy = e.touches[0].pageY - e.touches[1].pageY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (this.lastDistance) {
                let delta = distance / this.lastDistance;
                scale *= delta;

                let centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
                let centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;

                translateX = centerX - delta * (centerX - translateX);
                translateY = centerY - delta * (centerY - translateY);
            }

            this.lastDistance = distance;
        }
    });

    // Reset touch distance
    canvas.elt.addEventListener('touchend', () => {
        this.lastDistance = null;
    });

    // Drag to pan
    canvas.elt.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startX = e.offsetX - translateX;
        this.startY = e.offsetY - translateY;
    });

    canvas.elt.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
            translateX = e.offsetX - this.startX;
            translateY = e.offsetY - this.startY;
        }
    });

    canvas.elt.addEventListener('mouseup', () => {
        this.isDragging = false;
    });

    canvas.elt.addEventListener('mouseleave', () => {
        this.isDragging = false;
    });
}

function draw() {
    background(255);
    translate(translateX, translateY);
    scale(scale);
    
    stroke(0);
    strokeWeight(lineThickness);

    for (let i = 1; i < pathPoints.length; i++) {
        line(pathPoints[i - 1].x, pathPoints[i - 1].y, pathPoints[i].x, pathPoints[i].y);
    }

    if (timer) {
        moveRandomly();
    }
    
    adjustView();
}

function moveRandomly() {
    let stepSize = useFractalStepSize ? calculateFractalStepSize() : baseStepSize;
    let moves = [
        { x: 0, y: -stepSize },
        { x: stepSize, y: 0 },
        { x: 0, y: stepSize },
        { x: -stepSize, y: 0 }
    ];

    let possibleMoves = moves.map(move => ({
        x: currentLocation.x + move.x,
        y: currentLocation.y + move.y
    })).filter(point => !isInsideBarrier(point) && !pathPoints.some(p => p.x === point.x && p.y === point.y));

    if (possibleMoves.length > 0) {
        currentLocation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        pathPoints.push({ x: currentLocation.x, y: currentLocation.y });
        stepCount++;
    } else {
        noLoop();
        alert("No more possible moves and no backtrack options! The simulation has ended.");
    }
}

function calculateFractalStepSize() {
    if (fractalStepCounter === 0 || fractalStepCounter >= fractalSteps) {
        fractalStepCounter = 0;
        stepCount++;
        return baseStepSize + Math.sin(stepCount / 2.0) * baseStepSize;
    }
    fractalStepCounter++;
    return baseStepSize;
}

function isInsideBarrier(point) {
    for (let barrier of barriers) {
        if (barrier.contains(point.x, point.y)) {
            return true;
        }
    }
    return false;
}

function adjustView() {
    if (followWalk) {
        let centerX = width / 2;
        let centerY = height / 2;
        let targetX = centerX - currentLocation.x * scale;
        let targetY = centerY - currentLocation.y * scale;
        translateX += (targetX - translateX) * 0.1;
        translateY += (targetY - translateY) * 0.1;
    }
}

document.getElementById('start-button').addEventListener('click', () => {
    timer = true;
    loop();
});

document.getElementById('pause-button').addEventListener('click', () => {
    timer = false;
    noLoop();
});

document.getElementById('stop-button').addEventListener('click', () => {
    timer = false;
    pathPoints = [{ x: 400, y: 400 }];
    currentLocation = { x: 400, y: 400 };
    translateX = 0;
    translateY = 0;
    noLoop();
    redraw();
});

document.getElementById('follow-walk').addEventListener('change', (e) => {
    followWalk = e.target.checked;
});

document.getElementById('speed-slider').addEventListener('input', (e) => {
    let speed = e.target.value;
    frameRate(map(speed, 0, 100, 1, 60));
});

document.getElementById('line-thickness-slider').addEventListener('input', (e) => {
    lineThickness = e.target.value;
});
