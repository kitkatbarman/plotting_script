let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let scaleFactor = 1.0;
let translateX = 0;
let translateY = 0;
let timer = false;
let isPinching = false;
let initialDistance = 0;
let initialScale = 1.0;
let lastTouches = [];

// Setup p5.js canvas
function setup() {
    let canvas = createCanvas(800, 800);
    canvas.parent('canvas-container');
    canvas.elt.style.touchAction = 'none'; // Disable default touch actions
    pathPoints.push({ x: currentLocation.x, y: currentLocation.y });
    frameRate(10); // Start with a default speed

    // Prevent default touch actions to enable custom pinch and pan handling
    canvas.elt.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.elt.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.elt.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Add mouse wheel event for desktop zooming
    canvas.elt.addEventListener('wheel', handleMouseWheel, { passive: false });
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
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        isPinching = true;
        initialDistance = dist(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
        initialScale = scaleFactor;
    } else {
        isPinching = false;
        lastTouches = [...e.touches];
    }
    return false; // Prevent default
}

function handleTouchMove(e) {
    if (isPinching && e.touches.length === 2) {
        let currentDistance = dist(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
        let zoomFactor = currentDistance / initialDistance;
        let newScale = initialScale * zoomFactor;

        // Adjust the translation to zoom in/out around the center point between the touches
        let midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        adjustView(midX, midY, newScale);

        scaleFactor = newScale;
    } else if (!isPinching && e.touches.length === 1 && lastTouches.length === 1) {
        translateX += e.touches[0].clientX - lastTouches[0].clientX;
        translateY += e.touches[0].clientY - lastTouches[0].clientY;
        lastTouches = [...e.touches];
    }
    return false; // Prevent default
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        isPinching = false;
    }
    lastTouches = [...e.touches];
    return false; // Prevent default
}

function handleMouseWheel(e) {
    e.preventDefault();
    let delta = -e.deltaY * 0.01;
    let zoomFactor = 1 + delta;
    let newScale = scaleFactor * zoomFactor;

    // Adjust the translation to zoom in/out around the mouse pointer
    adjustView(e.offsetX, e.offsetY, newScale);

    scaleFactor = newScale;
}

function adjustView(centerX, centerY, newScale) {
    let zoomFactor = newScale / scaleFactor;
    translateX = (translateX - centerX) * zoomFactor + centerX;
    translateY = (translateY - centerY) * zoomFactor + centerY;
}

// Setup event listeners for buttons after DOM is loaded
window.onload = function() {
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const followWalkCheckbox = document.getElementById('follow-walk');
    const speedSlider = document.getElementById('speed-slider');

    if (startButton) {
        startButton.addEventListener('click', () => {
            timer = true;
            loop();
            console.log("Start button clicked.");
        });
    }

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            noLoop();
            console.log("Pause button clicked.");
        });
    }

    if (stopButton) {
        stopButton.addEventListener('click', () => {
            timer = false;
            noLoop();
            pathPoints = [{ x: 400, y: 400 }];
            currentLocation = [{ x: 400, y: 400 }];
            translateX = 0;
            translateY = 0;
            redraw();
            console.log("Stop button clicked.");
        });
    }

    if (followWalkCheckbox) {
        followWalkCheckbox.addEventListener('change', (e) => {
            followWalk = e.target.checked;
            console.log("Follow Walk changed to: " + followWalk);
        });
    }

    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            let speed = e.target.value;
            frameRate(map(speed, 0, 100, 1, 60));
            console.log("Speed changed to: " + speed);
        });
    }
};
