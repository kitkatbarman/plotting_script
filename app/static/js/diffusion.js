const diffusionCanvas = document.getElementById('diffusionCanvas');
const diffusionCtx = diffusionCanvas.getContext('2d');
const concentrationCanvas = document.getElementById('concentrationCanvas');
const concentrationCtx = concentrationCanvas.getContext('2d');

let particles = [];
let animationId;
let concentrationPlotId;
let isRunning = false;
let temperature = 5;  // Default temperature
let numGas1 = 500;    // Default number of Gas 1 particles
let numGas2 = 500;    // Default number of Gas 2 particles
const replenishThreshold = 50;

const gasProperties = [
    { size: 2, color: 'red' },  // Gas 1
    { size: 2, color: 'blue' }  // Gas 2
];

const numBins = 100; // Increased number of bins
const binWidth = diffusionCanvas.width / numBins;
let gridConcentrations1 = new Array(numBins).fill(0);
let gridConcentrations2 = new Array(numBins).fill(0);

// Apply an exponential scaling function to adjust velocity based on temperature
function scaleTemperature(temp) {
    return Math.pow(temp, 2) * 0.1; // Adjusted scaling factor
}

function createParticles() {
    const scaledTemp = scaleTemperature(temperature);
    particles = [];
    gridConcentrations1.fill(0);
    gridConcentrations2.fill(0);
    for (let i = 0; i < numGas1; i++) {
        const particle = {
            x: Math.random() * 50,
            y: Math.random() * diffusionCanvas.height,
            vx: (Math.random() - 0.5) * scaledTemp,
            vy: (Math.random() - 0.5) * scaledTemp,
            ...gasProperties[0]
        };
        particles.push(particle);
        updateGridConcentration(particle, 1);
    }
    for (let i = 0; i < numGas2; i++) {
        const particle = {
            x: diffusionCanvas.width - Math.random() * 50,
            y: Math.random() * diffusionCanvas.height,
            vx: (Math.random() - 0.5) * scaledTemp,
            vy: (Math.random() - 0.5) * scaledTemp,
            ...gasProperties[1]
        };
        particles.push(particle);
        updateGridConcentration(particle, 2);
    }
}

function replenishParticles() {
    let currentGas1Count = particles.filter(p => p.color === 'red' && p.x < 50).length;
    let currentGas2Count = particles.filter(p => p.color === 'blue' && p.x > diffusionCanvas.width - 50).length;
    const scaledTemp = scaleTemperature(temperature);

    while (currentGas1Count < numGas1 - replenishThreshold) {
        const particle = {
            x: Math.random() * 50,
            y: Math.random() * diffusionCanvas.height,
            vx: (Math.random() - 0.5) * scaledTemp,
            vy: (Math.random() - 0.5) * scaledTemp,
            ...gasProperties[0]
        };
        particles.push(particle);
        updateGridConcentration(particle, 1);
        currentGas1Count++;
    }

    while (currentGas2Count < numGas2 - replenishThreshold) {
        const particle = {
            x: diffusionCanvas.width - Math.random() * 50,
            y: Math.random() * diffusionCanvas.height,
            vx: (Math.random() - 0.5) * scaledTemp,
            vy: (Math.random() - 0.5) * scaledTemp,
            ...gasProperties[1]
        };
        particles.push(particle);
        updateGridConcentration(particle, 2);
        currentGas2Count++;
    }
}

function updateGridConcentration(particle, type) {
    const binIndex = Math.floor(particle.x / binWidth);
    if (type === 1) {
        gridConcentrations1[binIndex]++;
    } else if (type === 2) {
        gridConcentrations2[binIndex]++;
    }
}

function clearGridConcentration(particle, type) {
    const binIndex = Math.floor(particle.x / binWidth);
    if (type === 1) {
        gridConcentrations1[binIndex]--;
    } else if (type === 2) {
        gridConcentrations2[binIndex]--;
    }
}

function updateParticles() {
    particles.forEach(particle => {
        // Clear the old grid concentration
        clearGridConcentration(particle, particle.color === 'red' ? 1 : 2);

        // Apply random walk by adding small random changes to velocity
        particle.vx += (Math.random() - 0.5) * 0.2;
        particle.vy += (Math.random() - 0.5) * 0.2;

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reflect particles off the walls, with wrapping for top and bottom
        if (particle.x < 0) {
            particle.x = 0;
            particle.vx *= -1;
        }
        if (particle.x > diffusionCanvas.width) {
            particle.x = diffusionCanvas.width;
            particle.vx *= -1;
        }
        if (particle.y < 0) {
            particle.y = diffusionCanvas.height;
        }
        if (particle.y > diffusionCanvas.height) {
            particle.y = 0;
        }

        // Update the new grid concentration
        updateGridConcentration(particle, particle.color === 'red' ? 1 : 2);
    });

    replenishParticles();
}

function drawParticles() {
    diffusionCtx.clearRect(0, 0, diffusionCanvas.width, diffusionCanvas.height);
    particles.forEach(particle => {
        diffusionCtx.fillStyle = particle.color;
        diffusionCtx.beginPath();
        diffusionCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        diffusionCtx.fill();
    });
}

function smoothData(data, smoothingFactor) {
    const smoothedData = [];
    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            smoothedData.push(data[i]);
        } else {
            smoothedData.push(smoothedData[i - 1] * smoothingFactor + data[i] * (1 - smoothingFactor));
        }
    }
    return smoothedData;
}

function drawConcentrationPlot() {
    concentrationCtx.clearRect(0, 0, concentrationCanvas.width, concentrationCanvas.height);
    const maxConcentration = Math.max(...gridConcentrations1.concat(gridConcentrations2));
    const scale = concentrationCanvas.height / maxConcentration;

    // Apply smoothing
    const smoothedConcentrations1 = smoothData(gridConcentrations1, 0.1);
    const smoothedConcentrations2 = smoothData(gridConcentrations2, 0.1);

    // Draw tick marks and labels
    const numTicks = 10;
    const tickSpacing = concentrationCanvas.width / numTicks;
    const tickHeight = 5;

    // X-axis ticks and labels
    for (let i = 0; i <= numTicks; i++) {
        const x = i * tickSpacing;
        concentrationCtx.beginPath();
        concentrationCtx.moveTo(x, concentrationCanvas.height);
        concentrationCtx.lineTo(x, concentrationCanvas.height - tickHeight);
        concentrationCtx.stroke();
        concentrationCtx.fillText((i / numTicks).toFixed(1), x, concentrationCanvas.height - tickHeight - 5);
    }

    // Y-axis ticks and labels
    for (let i = 0; i <= numTicks; i++) {
        const y = i * (concentrationCanvas.height / numTicks);
        concentrationCtx.beginPath();
        concentrationCtx.moveTo(0, concentrationCanvas.height - y);
        concentrationCtx.lineTo(tickHeight, concentrationCanvas.height - y);
        concentrationCtx.stroke();
        concentrationCtx.fillText((maxConcentration * i / numTicks).toFixed(1), tickHeight + 5, concentrationCanvas.height - y + 3);
    }

    // Draw red concentration line, skipping the first and last bins
    concentrationCtx.strokeStyle = 'red';
    concentrationCtx.beginPath();
    for (let index = 1; index < numBins - 1; index++) {
        const x = index * binWidth;
        const y = concentrationCanvas.height - (smoothedConcentrations1[index] * scale);
        if (index === 1) {
            concentrationCtx.moveTo(x, y);
        } else {
            concentrationCtx.lineTo(x, y);
        }
    }
    concentrationCtx.stroke();

    // Draw blue concentration line, skipping the first and last bins
    concentrationCtx.strokeStyle = 'blue';
    concentrationCtx.beginPath();
    for (let index = 1; index < numBins - 1; index++) {
        const x = index * binWidth;
        const y = concentrationCanvas.height - (smoothedConcentrations2[index] * scale);
        if (index === 1) {
            concentrationCtx.moveTo(x, y);
        } else {
            concentrationCtx.lineTo(x, y);
        }
    }
    concentrationCtx.stroke();
}

function animate() {
    if (isRunning) {
        updateParticles();
        drawParticles();
        setTimeout(() => {
            animationId = requestAnimationFrame(animate);
        }, 25); // Adding a 25ms delay to slow down the animation
    }
}

function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        animate();
        updateConcentrationPlotPeriodically(); // Start periodic concentration plot updates
    }
}

function updateConcentrationPlotPeriodically() {
    if (isRunning) {
        drawConcentrationPlot();
        concentrationPlotId = setTimeout(updateConcentrationPlotPeriodically, 50); // Update every 0.05 seconds
    }
}

function pauseSimulation() {
    isRunning = false;
    cancelAnimationFrame(animationId);
    clearTimeout(concentrationPlotId);
}

function resetSimulation() {
    isRunning = false;
    cancelAnimationFrame(animationId);
    clearTimeout(concentrationPlotId);
    createParticles();
    drawParticles();
    drawConcentrationPlot();
}

function updateTemperature(value) {
    temperature = parseFloat(value);
    const scaledTemp = scaleTemperature(temperature);
    particles.forEach(particle => {
        particle.vx = (Math.random() - 0.5) * scaledTemp;
        particle.vy = (Math.random() - 0.5) * scaledTemp;
    });
}

function updateNumParticles(value, gasType) {
    if (gasType === 'gas1') {
        numGas1 = parseInt(value);
        document.getElementById('numGas1Value').innerText = value;
    } else if (gasType === 'gas2') {
        numGas2 = parseInt(value);
        document.getElementById('numGas2Value').innerText = value;
    }
    createParticles();  // Update particles based on new count
    drawParticles();
    drawConcentrationPlot();
}

// Initial setup to ensure the plots are visible from the start
function initializeSimulation() {
    createParticles();
    drawParticles();
    drawConcentrationPlot();
    // Trigger slider events programmatically to ensure settings are applied
    document.getElementById('numGas1').value = numGas1;
    document.getElementById('numGas2').value = numGas2;
    document.getElementById('temperature').value = temperature;
    document.getElementById('numGas1').dispatchEvent(new Event('input'));
    document.getElementById('numGas2').dispatchEvent(new Event('input'));
    document.getElementById('temperature').dispatchEvent(new Event('input'));

    // Start and immediately pause the simulation to initialize
    startSimulation();
    setTimeout(resetSimulation, 200);
}

initializeSimulation();
