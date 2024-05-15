let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let scaleFactor = 1.0;
let translateX = 0;
let translateY = 0;
let timer = false; // Initialize timer variable
let isPinching = false;
let initialDistance = 0;
let initialScale = 1.0;
let lastTouches = [];

function setup() {
    let canvas = createCanvas(800, 800);
    canvas.parent('canvas-container');
    pathPoints.push({ x: currentLocation.x, y: currentLocation.y });
    frameRate(10); // Start with a default speed
    console.log("Canvas setup completed."); // Debugging step

    // Prevent default touch actions to enable custom pinch and pan handling
    canvas.elt.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.elt.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    canvas.elt.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

    // Add mouse wheel event for desktop zooming
    canvas.elt.addEventListener('wheel', handleMouseWheel, { passive: false });

    // Setup p5 touch event handlers
    touchStarted();
    touchMoved();
    touchEnded();
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

function touchStarted() {
    if (touches.length === 2) {
        isPinching = true;
        initialDistance = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
        initialScale = scaleFactor;
    } else {
        isPinching = false;
        lastTouches = [...touches];
    }
    return false; // Prevent default
}

function touchMoved() {
    if (isPinching && touches.length === 2) {
        let currentDistance = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
        scaleFactor = initialScale * (currentDistance / initialDistance);

        // Adjust the translation to zoom in/out around the center point between the touches
        let midX = (touches[0].x + touches[1].x) / 2;
        let midY = (touches[0].y + touches[1].y) / 2;
        adjustView(midX, midY, currentDistance / initialDistance);
    } else if (!isPinching && touches.length === 1 && lastTouches.length === 1) {
        translateX += touches[0].x - lastTouches[0].x;
        translateY += touches[0].y - lastTouches[0].y;
        lastTouches = [...touches];
    }
    return false; // Prevent default
}

function touchEnded() {
    if (touches.length < 2) {
        isPinching = false;
    }
    lastTouches = [...touches];
    return false; // Prevent default
}

function handleMouseWheel(e) {
    e.preventDefault();
    let delta = -e.deltaY * 0.01;
    let factor = 1 + delta;
    scaleFactor *= factor;

    // Adjust the translation to zoom in/out around the mouse pointer
    adjustView(e.offsetX, e.offsetY, factor);
}

function adjustView(centerX, centerY, zoomFactor) {
    translateX = (translateX - centerX) * zoomFactor + centerX;
    translateY = (translateY - centerY) * zoomFactor + centerY;
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
