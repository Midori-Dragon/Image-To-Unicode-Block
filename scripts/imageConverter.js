import { appState } from './appState.js';

/**
 * Class responsible for converting an image to a Unicode block representation.
 */
export class ImageConverter {
    constructor() {
        this._image;

        appState.onPropertyChange('zoomFactor', (value) => {
            this._blockWidth = Math.max(1, Math.floor(1 * value));
            this._blockHeight = Math.max(1, Math.floor(2 * value));
            this.adjustCanvasSize();
            this.convert();
        });
        appState.onPropertyChange('fullChar', () => this.convert());
        appState.onPropertyChange('transChar', () => this.convert());
        appState.onPropertyChange('transThreshold', () => this.convert());
        appState.onloadImage(() => appState.state.zoomFactor = appState.state.zoomFactor);

        this._blockWidth;
        this._blockHeight;
        this._imageData;

        this._onUpdateAction;
    }

    /**
     * Sets the action to be called when the image is updated.
     *
     * @param {Function} action - The action to be called when the image is updated.
     */
    onupdate(action) {
        this._onUpdateAction = action;
    }

    /**
     * Converts the image to a Unicode block representation.
     * 
     * @returns {HTMLElement} - The HTML element containing the Unicode block representation.
     */
    convert() {
        if (appState.state.imageSelected === false)
            return;
        const resultLines = this.processImageBlocks(appState.canvas, this._imageData, this._blockWidth, this._blockHeight, appState.state.fullChar, appState.state.transChar);
        if (appState.elements.showLinkElem.checked) {
            resultLines.push(`<br><a id="pixels-link" href="${window.location}">pixels from ${document.title}</a>`);
        }

        const resultContainer = document.createElement('div');
        resultContainer.className = 'table';
        resultContainer.innerHTML = resultLines.join('');
        if (this._onUpdateAction)
            this._onUpdateAction(resultContainer);
        return resultContainer;
    }

    /**
     * Adjusts the canvas size according to zoom factor.
     * Updates the canvas width and height, and draws the image on the canvas.
     * Also updates the internal image data.
     */
    adjustCanvasSize() {
        appState.canvas.width = Math.round(appState.image.width / appState.state.zoomFactor);
        appState.canvas.height = Math.round(appState.image.height / appState.state.zoomFactor);
        appState.ctx.drawImage(appState.image, 0, 0, appState.canvas.width, appState.canvas.height);
        this._imageData = appState.ctx.getImageData(0, 0, appState.canvas.width, appState.canvas.height);
    }

    /**
     * Process image blocks to generate HTML lines.
     * 
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {ImageData} imageData - The image data to process.
     * @param {number} blockWidth - The width of each block in pixels.
     * @param {number} blockHeight - The height of each block in pixels.
     * @param {string} fullChar - The character to use for blocks with opacity greater than 50%.
     * @param {string} transChar - The character to use for blocks with opacity less than or equal to 50%.
     * @returns {Array<string>} - An array of strings containing the HTML lines representing the image.
     */
    processImageBlocks(canvas, imageData, blockWidth, blockHeight, fullChar, transChar) {
        const resultLines = [];
        for (let y = 0; y < canvas.height; y += blockHeight) {
            const actualBlockHeight = (y + blockHeight > canvas.height) ? canvas.height - y : blockHeight;
            const line = this.processLine(canvas, imageData, y, blockWidth, actualBlockHeight, fullChar, transChar);
            resultLines.push(line);
        }
        return resultLines;
    }

    /**
     * Generates HTML for a single line.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {ImageData} imageData - The image data to process.
     * @param {number} y - The y-coordinate of the line.
     * @param {number} blockWidth - The width of each block in pixels.
     * @param {number} blockHeight - The height of each block in pixels.
     * @param {string} fullChar - The character to use for normal blocks.
     * @param {string} transChar - The character to use for transparent blocks.
     * @returns {string} - The HTML line representing the image.
     */
    processLine(canvas, imageData, y, blockWidth, blockHeight, fullChar, transChar) {
        let lineResult = `<div class="row-${y / blockHeight}"><span>`;
        let lastColor;

        for (let x = 0; x < canvas.width; x += blockWidth) {
            const actualBlockWidth = (x + blockWidth > canvas.width) ? canvas.width - x : blockWidth;
            const avgColor = this.calculateBlockAverageColor(canvas, imageData, x, y, actualBlockWidth, blockHeight);
            const char = avgColor.a <= appState.state.transThreshold ? transChar : fullChar;
            if (lastColor === `${avgColor.r}${avgColor.g}${avgColor.b}`) {
                lineResult += char;
            } else {
                lineResult += `</span><span class="cell-${x / blockWidth}" style="color: rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})">${char}`;
                lastColor = `${avgColor.r}${avgColor.g}${avgColor.b}`;
            }
        }
        lineResult += '</span></div>';
        return lineResult;
    }

    /**
     * Calculates the average color of a pixel block.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
     * @param {ImageData} data - The image data to process.
     * @param {number} startX - The x-coordinate of the block's start position.
     * @param {number} startY - The y-coordinate of the block's start position.
     * @param {number} blockWidth - The width of the block in pixels.
     * @param {number} blockHeight - The height of the block in pixels.
     * @returns {Object<r, g, b, a>} - An object containing the RGBA values of the average color.
     */
    calculateBlockAverageColor(canvas, data, startX, startY, blockWidth, blockHeight) {
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
        return this.calculateAverageColor(total, pixelCount);
    }

    /**
     * Calculates the average color of a total pixel amount.
     *
     * @param {Object<r, g, b, a>} data - The object containing the total RGBA values of the all colors from the pixels.
     * @param {number} pixelCount - The number of pixels used to calculate the color.
     * @returns {Object<r, g, b, a>} - The object containing the calculated RGBA values of the average color.
     */
    calculateAverageColor(data, pixelCount) {
        return {
            r: Math.round(data.r / pixelCount),
            g: Math.round(data.g / pixelCount),
            b: Math.round(data.b / pixelCount),
            a: Math.round(data.a / pixelCount)
        };
    }
}
