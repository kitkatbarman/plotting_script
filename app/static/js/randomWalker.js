let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let canvasScale = 1.0; // Renamed from 'scale' to 'canvasScale'
let translateX = 0;
let translateY = 0;
const BASE_STEP_SIZE = 50;
let useFractalStepSize = false;
let fractalSteps = 30;
let fractalStepCounter = 0;
let stepCount = 0;
let barriers = [];
let randomnessLevel = 0;
let timer = false;
let followWalk = false;
let backtrackStack = [];
let lastDragPoint = null;
let lineThickness = 2; // Default line thickness
let canvas; // Reference to the canvas

function setup() {
    canvas = createCanvas(800, 800);
    canvas.parent('canvas-container'); // Attach the canvas to the div container
    pathPoints.push({ x: currentLocation.x, y: currentLocation.y, isBacktrack: false });
    frameRate(10); // Start with a default speed
    noLoop(); // Start with animation stopped

    // Line thickness slider event listener
    document.getElementById('line-thickness-slider').addEventListener('input', (e) => {
        lineThickness = e.target.value;
    });

    // Speed slider event listener
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        let speed = e.target.value;
        frameRate(map(speed, 0, 100, 1, 60));
    });
}

function draw() {
    background(255);
    translate(translateX, translateY);
    scale(canvasScale); // Use 'canvasScale' instead of 'scale'
    
    stroke(0);
    strokeWeight(lineThickness); // Set line thickness based on slider value

    for (let i = 1; i < pathPoints.length; i++) {
        let prevPoint = pathPoints[i - 1];
        let currPoint = pathPoints[i];
        if (isAdjacent(prevPoint, currPoint)) {
            line(prevPoint.x, prevPoint.y, currPoint.x, currPoint.y);
        }
    }

    if (timer) {
        moveRandomly();
    }
    
    adjustView();
}

function moveRandomly() {
    let stepSize = useFractalStepSize ? calculateFractalStepSize() : BASE_STEP_SIZE;
    let moves = [
        { x: 0, y: -stepSize },
        { x: stepSize, y: 0 },
        { x: 0, y: stepSize },
        { x: -stepSize, y: 0 }
    ];

    let possibleMoves = moves.map(move => ({
        x: currentLocation.x + move.x,
        y: currentLocation.y + move.y
    })).filter(point => !isInsideBarrier(point) && !pathPoints.some(p => p.x === point.x && p.y === point.y && !p.isBacktrack));

    if (possibleMoves.length > 0) {
        let chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        currentLocation = chosenMove;
        pathPoints.push({ x: currentLocation.x, y: currentLocation.y, isBacktrack: false });
        stepCount++;
        backtrackStack.push({ x: currentLocation.x, y: currentLocation.y }); // Push forward moves onto the backtrack stack
    } else {
        handleBacktracking();
    }
}

function calculateFractalStepSize() {
    if (fractalStepCounter === 0 || fractalStepCounter >= fractalSteps) {
        fractalStepCounter = 0;
        stepCount++;
        return BASE_STEP_SIZE + Math.sin(stepCount / 2.0) * BASE_STEP_SIZE;
    }
    fractalStepCounter++;
    return BASE_STEP_SIZE;
}

function isInsideBarrier(point) {
    for (let barrier of barriers) {
        if (barrier.contains(point.x, point.y)) {
            return true;
        }
    }
    return false;
}

function handleBacktracking() {
    if (backtrackStack.length > 0) {
        let lastMove = backtrackStack.pop();
        currentLocation = { x: lastMove.x, y: lastMove.y };
        pathPoints.push({ x: currentLocation.x, y: currentLocation.y, isBacktrack: true });
        stepCount++;
    } else {
        noLoop();
        alert("No more possible moves and no backtrack options! The simulation has ended.");
    }
}

function isAdjacent(point1, point2) {
    let dx = Math.abs(point1.x - point2.x);
    let dy = Math.abs(point1.y - point2.y);
    return (dx === BASE_STEP_SIZE && dy === 0) || (dx === 0 && dy === BASE_STEP_SIZE);
}

function adjustView() {
    if (followWalk) {
        let centerX = width / 2;
        let centerY = height / 2;
        let targetX = centerX - currentLocation.x * canvasScale;
        let targetY = centerY - currentLocation.y * canvasScale;
        translateX += (targetX - translateX) * 0.1;
        translateY += (targetY - translateY) * 0.1;
    }
}

function mouseWheel(event) {
    if (isMouseInsideCanvas()) {
        let zoomFactor = 1.1;
        if (event.delta > 0) {
            canvasScale /= zoomFactor;
        } else {
            canvasScale *= zoomFactor;
        }
        return false; // Prevent default behavior
    }
}

function mousePressed() {
    if (isMouseInsideCanvas()) {
        lastDragPoint = { x: mouseX, y: mouseY };
    }
}

function mouseDragged() {
    if (lastDragPoint && isMouseInsideCanvas()) {
        translateX += mouseX - lastDragPoint.x;
        translateY += mouseY - lastDragPoint.y;
        lastDragPoint = { x: mouseX, y: mouseY };
    }
}

function isMouseInsideCanvas() {
    return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

function saveCanvasToFile() {
    saveCanvas(canvas, 'random_walk', 'png');
}

document.getElementById('start-button').addEventListener('click', () => {
    timer = true;
    loop(); // Starts p5.js draw loop
});

document.getElementById('pause-button').addEventListener('click', () => {
    timer = false;
    noLoop(); // Stops p5.js draw loop
});

document.getElementById('stop-button').addEventListener('click', () => {
    timer = false;
    pathPoints = [{ x: 400, y: 400, isBacktrack: false }];
    currentLocation = { x: 400, y: 400 };
    translateX = 0;
    translateY = 0;
    backtrackStack = [];
    noLoop();
    redraw(); // Forces a redraw of the canvas
});

document.getElementById('follow-walk').addEventListener('change', (e) => {
    followWalk = e.target.checked;
});

document.getElementById('save-button').addEventListener('click', saveCanvasToFile);
