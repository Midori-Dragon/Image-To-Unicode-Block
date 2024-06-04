// Convert image to unicode
export function imageToUnicode(canvas, ctx, image, zoomFactor, fullChar, transChar, showLink) {
    const blockWidth = Math.max(1, Math.floor(1 * zoomFactor));
    const blockHeight = Math.max(1, Math.floor(2 * zoomFactor));
    adjustCanvasSize(image, canvas, ctx, zoomFactor);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let resultLines = processImageBlocks(canvas, imageData, blockWidth, blockHeight, fullChar, transChar);

    if (showLink === true) {
        resultLines.push(generateLinkHtml());
    }

    return createUnicodeHtmlNode(resultLines);
}

// Adjusts the canvas size according to zoom factor
function adjustCanvasSize(image, canvas, ctx, zoomFactor) {
    canvas.width = Math.round(image.width / zoomFactor);
    canvas.height = Math.round(image.height / zoomFactor);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

// Process image blocks to generate HTML lines
function processImageBlocks(canvas, imageData, blockWidth, blockHeight, fullChar, transChar) {
    const resultLines = [];
    for (let y = 0; y < canvas.height; y += blockHeight) {
        const actualBlockHeight = (y + blockHeight > canvas.height) ? canvas.height - y : blockHeight;
        resultLines.push(processLine(canvas, imageData, y, blockWidth, actualBlockHeight, fullChar, transChar));
    }
    return resultLines;
}

// Generates HTML for a single line
function processLine(canvas, imageData, y, blockWidth, blockHeight, fullChar, transChar) {
    let lineResult = `<div class="row-${y / blockHeight}"><span>`;
    let lastColor;

    for (let x = 0; x < canvas.width; x += blockWidth) {
        const actualBlockWidth = (x + blockWidth > canvas.width) ? canvas.width - x : blockWidth;
        const avgColor = calculateBlockAverageColor(canvas, imageData, x, y, actualBlockWidth, blockHeight);
        const char = avgColor.a <= 50 ? transChar : fullChar;
        if (lastColor === `${avgColor.r}${avgColor.g}${avgColor.b}`) {
            lineResult += char;
        } else {
            lineResult += `</span><span class="cell-${x / blockWidth}" style="color: rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})">${char}`;
            lastColor = `${avgColor.r}${avgColor.g}${avgColor.b}`;
        }
    }
    lineResult += "</span></div>";
    return lineResult;
}

// Calculates average color of a block
function calculateBlockAverageColor(canvas, data, startX, startY, blockWidth, blockHeight) {
    let total = { r: 0, g: 0, b: 0, a: 0 }, pixelCount = 0;

    for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
            const idx = ((startY + by) * canvas.width + (startX + bx)) * 4;
            total.r += data.data[idx];
            total.g += data.data[idx + 1];
            total.b += data.data[idx + 2];
            total.a += data.data[idx + 3];
            pixelCount++;
        }
    }

    if (pixelCount === 0) return { r: 255, g: 255, b: 255, a: 255 };
    return calculateAverageColor(total, pixelCount);
}

// Calculates average color
function calculateAverageColor(data, pixelCount) {
    return {
        r: Math.round(data.r / pixelCount),
        g: Math.round(data.g / pixelCount),
        b: Math.round(data.b / pixelCount),
        a: Math.round(data.a / pixelCount)
    };
}

// Generate the link HTML if needed
function generateLinkHtml() {
    return `<br><a id="pixels-link" href="${window.location}">pixels from ${window.location}</a>`;
}

// Creates the final HTML node for display
function createUnicodeHtmlNode(resultLines) {
    const resultContainer = document.createElement("div");
    resultContainer.className = "table";
    resultContainer.innerHTML = resultLines.join("");
    return resultContainer;
}
