let pathPoints = [];
let currentLocation = { x: 400, y: 400 };
let canvasScale = 0.5; // Renamed from 'scale' to 'canvasScale'
let translateX = 0;
let translateY = 0;
let baseStepSize = 50;
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
let initialPinchDistance;
let initialScale;

function setup() {
    let canvasSize = isMobileDevice() ? 400 : 800;
    canvas = createCanvas(canvasSize, canvasSize);
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

    // Zoom slider event listener
    document.getElementById('zoom-slider').addEventListener('input', (e) => {
        canvasScale = map(e.target.value, 0, 100, 0.01, 2.0);
        redraw();
    });

    // Save button event listener
    document.getElementById('save-button').addEventListener('click', () => {
        saveDrawing();
    });

    // Add touch event listeners
    canvas.elt.addEventListener('touchstart', handleTouchStart, false);
    canvas.elt.addEventListener('touchmove', handleTouchMove, false);
}

function draw() {
    background(255);
    translate(translateX, translateY);
    scale(canvasScale); // Use 'canvasScale' instead of 'scale'

    for (let i = 1; i < pathPoints.length; i++) {
        let prevPoint = pathPoints[i - 1];
        let currPoint = pathPoints[i];

        // Check if the points are adjacent
        if (isAdjacent(prevPoint, currPoint)) {
            // Draw all lines in black
            stroke(0);
            strokeWeight(lineThickness); // Set line thickness based on slider value
            line(prevPoint.x, prevPoint.y, currPoint.x, currPoint.y);
        }
    }

    if (timer) {
        moveRandomly();
    }

    adjustView();
}

function saveDrawing() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pathPoints.forEach(point => {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
    });

    let width = maxX - minX;
    let height = maxY - minY;
    let marginX = width * 0.05;
    let marginY = height * 0.05;

    let tempCanvas = createGraphics(width + 2 * marginX, height + 2 * marginY);
    tempCanvas.translate(marginX - minX, marginY - minY);

    tempCanvas.background(255);
    tempCanvas.scale(1); // No need for canvasScale here
    for (let i = 1; i < pathPoints.length; i++) {
        let prevPoint = pathPoints[i - 1];
        let currPoint = pathPoints[i];

        if (isAdjacent(prevPoint, currPoint)) {
            tempCanvas.stroke(0);
            tempCanvas.strokeWeight(lineThickness);
            tempCanvas.line(prevPoint.x, prevPoint.y, currPoint.x, currPoint.y);
        }
    }

    save(tempCanvas, 'random_walk.png');
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
    return (dx === baseStepSize && dy === 0) || (dx === 0 && dy === baseStepSize);
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
        let zoomAmount = (event.delta > 0) ? 1 / zoomFactor : zoomFactor;
        zoomAtMousePosition(zoomAmount, mouseX, mouseY);
        return false; // Prevent default behavior
    }
}

function zoomAtMousePosition(zoomAmount, x, y) {
    let wx = (x - translateX) / canvasScale;
    let wy = (y - translateY) / canvasScale;
    canvasScale *= zoomAmount;
    translateX = x - wx * canvasScale;
    translateY = y - wy * canvasScale;

    // Update the zoom slider to reflect the current canvasScale
    let zoomSlider = document.getElementById('zoom-slider');
    zoomSlider.value = map(canvasScale, 0.01, 2.0, 0, 100);
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

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        initialPinchDistance = dist(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
        initialScale = canvasScale;
    }
    lastDragPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function handleTouchMove(e) {
    if (e.touches.length === 1 && lastDragPoint) {
        let dx = e.touches[0].clientX - lastDragPoint.x;
        let dy = e.touches[0].clientY - lastDragPoint.y;
        translateX += dx;
        translateY += dy;
        lastDragPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
        let midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        let currentPinchDistance = dist(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
        let scaleChange = currentPinchDistance / initialPinchDistance;

        // Calculate the canvas coordinates of the midpoint before the scale change
        let wx = (midX - translateX) / canvasScale;
        let wy = (midY - translateY) / canvasScale;

        // Apply the scale change
        canvasScale = initialScale * scaleChange;

        // Calculate the new translate values to keep the midpoint in the same place
        translateX = midX - wx * canvasScale;
        translateY = midY - wy * canvasScale;

        // Optionally, you can add some boundaries or limits to the scaling and translation to avoid excessive zooming or panning
        canvasScale = constrain(canvasScale, 0.01, 2.0); // Adjust these limits as needed

        // Update the zoom slider to reflect the current canvasScale
        let zoomSlider = document.getElementById('zoom-slider');
        zoomSlider.value = map(canvasScale, 0.01, 2.0, 0, 100);
    }
    e.preventDefault();
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
