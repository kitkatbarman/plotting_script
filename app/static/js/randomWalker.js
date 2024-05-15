let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let scaleFactor = 1.0;
let translateX = 0;
let translateY = 0;
let initialDistance = 0;
let initialScale = 1.0;
let isPinching = false;
let lastTouches = [];
let timer = false; // Initialize timer variable

function setup() {
    let canvas = createCanvas(800, 800);
    canvas.parent('canvas-container');
    pathPoints.push({ x: currentLocation.x, y: currentLocation.y });
    frameRate(10); // Start with a default speed
    console.log("Canvas setup completed."); // Debugging step
}

function draw() {
    background(255);
    translate(translateX, translateY);
    scale(scaleFactor);

    stroke(0);
    strokeWeight(document.getElementById('line-thickness-slider').value);

    for (let i = 1; i < pathPoints.length; i++) {
        line(pathPoints[i - 1].x, pathPoints[i - 1].y, pathPoints[i].x, pathPoints[i].y);
    }

    if (timer) {
        moveRandomly(); // Assuming moveRandomly is defined
    }

    console.log("Drawing frame."); // Debugging step
}

document.getElementById('start-button').addEventListener('click', () => {
    timer = true;
    loop();
    console.log("Start button clicked."); // Debugging step
});

document.getElementById('pause-button').addEventListener('click', () => {
    noLoop();
    console.log("Pause button clicked."); // Debugging step
});

document.getElementById('stop-button').addEventListener('click', () => {
    timer = false;
    noLoop();
    pathPoints = [{ x: 400, y: 400 }];
    currentLocation = { x: 400, y: 400 };
    translateX = 0;
    translateY = 0;
    redraw();
    console.log("Stop button clicked."); // Debugging step
});

document.getElementById('follow-walk').addEventListener('change', (e) => {
    followWalk = e.target.checked;
    console.log("Follow Walk changed to: " + followWalk); // Debugging step
});

document.getElementById('speed-slider').addEventListener('input', (e) => {
    let speed = e.target.value;
    frameRate(map(speed, 0, 100, 1, 60));
    console.log("Speed changed to: " + speed); // Debugging step
});

document.getElementById('zoom-slider').addEventListener('input', (e) => {
    scaleFactor = e.target.value;
    console.log("Zoom changed to: " + scaleFactor); // Debugging step
});
