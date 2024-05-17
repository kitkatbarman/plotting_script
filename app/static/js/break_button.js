let buttonPresses = 0;
let previousRecord = 0;

function lightenButton() {
    buttonPresses++;
    document.getElementById('press-count').textContent = buttonPresses;

    let button = document.getElementById('break-button');

    // Visual feedback for button press
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);

    // Calculate the probability of breaking
    let lambda = Math.log(2) / 500; // Sets the breaking probability to 0.5 at 500 presses
    let probability = 1 - Math.exp(-lambda * buttonPresses);
    if (Math.random() < probability && buttonPresses > 1) {
        button.disabled = true;
        button.style.backgroundColor = 'grey';  // Grey out the button when broken
        let tryAgainButton = document.getElementById('try-again-button');
        tryAgainButton.style.display = 'block';

        // Update previous record if needed
        if (buttonPresses > previousRecord) {
            previousRecord = buttonPresses;
            document.getElementById('previous-record').textContent = previousRecord;
        }
    } else {
        // Lighten the button color only if not broken
        if (buttonPresses > 1) {
            let currentColor = button.style.backgroundColor;
            let newColor = lightenColor(currentColor);
            button.style.backgroundColor = newColor;
        }

        // Occasionally trigger bonus clicks
        if (Math.random() < 0.1) {
            buttonPresses += 5;
            document.getElementById('press-count').textContent = buttonPresses;
            showMessage("You got lucky!");
        }
    }
}

function lightenColor(color) {
    // Implement your code to lighten the color here
    // This is just a placeholder
    return 'lightgrey';
}

function resetButton() {
    buttonPresses = 0;
    document.getElementById('press-count').textContent = buttonPresses;
    let button = document.createElement('button');
    button.textContent = 'Break Me';
    button.id = 'break-button';
    button.onclick = lightenButton;
    button.style.backgroundColor = '';  // Reset the button color
    let parent = document.getElementById('button-container');
    parent.replaceChild(button, document.getElementById('break-button'));
    let tryAgainButton = document.getElementById('try-again-button');
    tryAgainButton.style.display = 'none';
}

function showMessage(message) {
    let messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 2000);
}

// Create floating boxes
function createFloatingBoxes() {
    const container = document.body;
    for (let i = 0; i < 40; i++) {  // Increased number of boxes
        let box = document.createElement('div');
        box.className = 'floating-box';
        box.style.top = `${Math.random() * 100}vh`;
        box.style.left = `${Math.random() * 100}vw`;
        container.appendChild(box);
        animateBox(box);
    }
}

function animateBox(box) {
    let xSpeed = Math.random() * 2 + 1;
    let ySpeed = Math.random() * 2 + 1;
    let xDirection = Math.random() < 0.5 ? 1 : -1;
    let yDirection = Math.random() < 0.5 ? 1 : -1;

    function move() {
        let rect = box.getBoundingClientRect();
        let xPos = rect.left + xDirection * xSpeed;
        let yPos = rect.top + yDirection * ySpeed;

        if (xPos <= 0 || xPos >= window.innerWidth - rect.width) {
            xDirection *= -1;
        }
        if (yPos <= 0 || yPos >= window.innerHeight - rect.height) {
            yDirection *= -1;
        }

        box.style.left = `${xPos}px`;
        box.style.top = `${yPos}px`;

        requestAnimationFrame(move);
    }

    move();
}

document.addEventListener('DOMContentLoaded', createFloatingBoxes);
