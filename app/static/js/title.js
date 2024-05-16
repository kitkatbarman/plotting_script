document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('titleCanvas');
    const ctx = canvas.getContext('2d');
    let draggingLetter = null;
    let offsetX, offsetY;
    let prevMouseX, prevMouseY;
    let mouseX, mouseY;
    let lastMouseX, lastMouseY;
    let lastMoveTime;

    function drawEmptyBox() {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        // Define the box dimensions
        const boxWidth = 200;
        const boxHeight = 200;

        // Calculate the top-left corner position to center the box
        const xStart = (canvas.width - boxWidth) / 2;
        const yStart = (canvas.height - boxHeight) / 2;

        // Draw the outer rectangle (box)
        ctx.strokeRect(xStart, yStart, boxWidth, boxHeight); // (x, y, width, height)

        return { xStart, yStart, boxWidth, boxHeight };
    }

    function drawLetter(ctx, letter, x, y) {
        ctx.fillStyle = "#000";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, x, y);
    }

    function initializeLetters(box) {
        const letters = "USEFUL".split("");
        const letterObjects = [];
        const letterSpacing = box.boxWidth / (letters.length + 1);
        const startX = box.xStart + letterSpacing;
        const startY = box.yStart + box.boxHeight / 2;

        letters.forEach((letter, index) => {
            letterObjects.push({
                letter: letter,
                x: startX + index * letterSpacing,
                y: startY,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                dragging: false
            });
        });

        return letterObjects;
    }

    function updatePositions(letterObjects, box) {
        letterObjects.forEach(letterObj => {
            // Update position for random walk
            if (!letterObj.dragging) {
                letterObj.x += letterObj.dx;
                letterObj.y += letterObj.dy;
            }

            // Apply drag to slow down the letters
            letterObj.dx *= 0.99;
            letterObj.dy *= 0.99;

            // Bounce off the edges
            const textWidth = 16; // Approximate half-width of the letter
            const textHeight = 16; // Approximate half-height of the letter
            
            if (letterObj.x - textWidth < box.xStart) {
                letterObj.x = box.xStart + textWidth;
                letterObj.dx = -letterObj.dx;
            } else if (letterObj.x + textWidth > box.xStart + box.boxWidth) {
                letterObj.x = box.xStart + box.boxWidth - textWidth;
                letterObj.dx = -letterObj.dx;
            }
            
            if (letterObj.y - textHeight < box.yStart) {
                letterObj.y = box.yStart + textHeight;
                letterObj.dy = -letterObj.dy;
            } else if (letterObj.y + textHeight > box.yStart + box.boxHeight) {
                letterObj.y = box.yStart + box.boxHeight - textHeight;
                letterObj.dy = -letterObj.dy;
            }
        });

        // Handle collisions between letters
        for (let i = 0; i < letterObjects.length; i++) {
            for (let j = i + 1; j < letterObjects.length; j++) {
                const letterA = letterObjects[i];
                const letterB = letterObjects[j];
                const dx = letterA.x - letterB.x;
                const dy = letterA.y - letterB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 24; // Approximate diameter of a letter

                if (distance < minDistance) {
                    // Simple elastic collision response
                    const angle = Math.atan2(dy, dx);
                    const targetX = letterB.x + Math.cos(angle) * minDistance;
                    const targetY = letterB.y + Math.sin(angle) * minDistance;
                    const ax = (targetX - letterA.x) * 0.05;
                    const ay = (targetY - letterA.y) * 0.05;
                    letterA.dx -= ax;
                    letterA.dy -= ay;
                    letterB.dx += ax;
                    letterB.dy += ay;
                }
            }
        }
    }

    const box = drawEmptyBox();
    let letterObjects = initializeLetters(box);

    function update() {
        // Clear the canvas with a slight transparency for the trail effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw the empty box
        drawEmptyBox();

        // Draw the letters
        letterObjects.forEach(letterObj => {
            drawLetter(ctx, letterObj.letter, letterObj.x, letterObj.y);
        });

        // Update positions
        updatePositions(letterObjects, box);

        requestAnimationFrame(update);
    }

    // Add event listener to reset icon
    const resetIcon = document.querySelector(".reset-icon");
    resetIcon.addEventListener("click", function() {
        letterObjects = initializeLetters(box);
    });

    // Add event listeners for dragging letters with mouse
    canvas.addEventListener("mousedown", function(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        letterObjects.forEach(letterObj => {
            const textWidth = 24; // Approximate half-width of the letter
            const textHeight = 24; // Approximate half-height of the letter
            if (mouseX > letterObj.x - textWidth && mouseX < letterObj.x + textWidth &&
                mouseY > letterObj.y - textHeight && mouseY < letterObj.y + textHeight) {
                draggingLetter = letterObj;
                letterObj.dragging = true;
                offsetX = mouseX - letterObj.x;
                offsetY = mouseY - letterObj.y;
                lastMouseX = mouseX;
                lastMouseY = mouseY;
                lastMoveTime = performance.now();
            }
        });
    });

    canvas.addEventListener("mousemove", function(e) {
        if (draggingLetter) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            draggingLetter.x = mouseX - offsetX;
            draggingLetter.y = mouseY - offsetY;

            // Calculate the time elapsed since the last move
            const now = performance.now();
            const timeElapsed = now - lastMoveTime;

            if (timeElapsed > 0) {
                // Calculate the velocity
                draggingLetter.dx = (mouseX - lastMouseX) / timeElapsed * 16.67; // Scale to roughly 60fps
                draggingLetter.dy = (mouseY - lastMouseY) / timeElapsed * 16.67; // Scale to roughly 60fps
            }

            lastMouseX = mouseX;
            lastMouseY = mouseY;
            lastMoveTime = now;
        }
    });

    canvas.addEventListener("mouseup", function(e) {
        if (draggingLetter) {
            draggingLetter.dragging = false;
            draggingLetter = null;
        }
    });

    canvas.addEventListener("mouseout", function() {
        if (draggingLetter) {
            draggingLetter.dragging = false;
            draggingLetter = null;
        }
    });

    // Add event listeners for dragging letters with touch
    canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        letterObjects.forEach(letterObj => {
            const textWidth = 24; // Approximate half-width of the letter
            const textHeight = 24; // Approximate half-height of the letter
            if (mouseX > letterObj.x - textWidth && mouseX < letterObj.x + textWidth &&
                mouseY > letterObj.y - textHeight && mouseY < letterObj.y + textHeight) {
                draggingLetter = letterObj;
                letterObj.dragging = true;
                offsetX = mouseX - letterObj.x;
                offsetY = mouseY - letterObj.y;
                lastMouseX = mouseX;
                lastMouseY = mouseY;
                lastMoveTime = performance.now();
            }
        });
    });

    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        if (draggingLetter) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;
            draggingLetter.x = mouseX - offsetX;
            draggingLetter.y = mouseY - offsetY;

            // Calculate the time elapsed since the last move
            const now = performance.now();
            const timeElapsed = now - lastMoveTime;

            if (timeElapsed > 0) {
                // Calculate the velocity
                draggingLetter.dx = (mouseX - lastMouseX) / timeElapsed * 16.67; // Scale to roughly 60fps
                draggingLetter.dy = (mouseY - lastMouseY) / timeElapsed * 16.67; // Scale to roughly 60fps
            }

            lastMouseX = mouseX;
            lastMouseY = mouseY;
            lastMoveTime = now;
        }
    });

    canvas.addEventListener("touchend", function(e) {
        e.preventDefault();
        if (draggingLetter) {
            draggingLetter.dragging = false;
            draggingLetter = null;
        }
    });

    update();
});
