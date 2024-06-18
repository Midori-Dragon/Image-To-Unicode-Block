import { appState } from './appState.js';

/**
 * Converts the Unicode representation of the image to a formatted text string.
 * 
 * @return {string} The formatted text string representing the Unicode image.
 */
export function convertUnicode() {
    let templateString = appState.elements.templateStringElem.value;
    if (templateString === '')
        templateString = '[color=${color}]${text}[/color]';

    let rows = getUnicodeAsRows(appState.elements.unicodeResultElem);
    let convertedText = '';
    for (const row of rows) {
        for (const stack of row) {
            convertedText += templateString.replace(/\$\{color\}/g, stack.color).replace(/\$\{text\}/g, stack.text);;
        }
        convertedText += '\n';
    }

    if (appState.elements.showLinkElem.checked) {
        let pixelsFromText = templateString.replace(/\$\{color\}/g, window.location).replace(/\$\{text\}/g, `pixels from ${document.title}`);
        pixelsFromText = pixelsFromText.replaceAll('color', 'url');
        convertedText += pixelsFromText;
    }

    return convertedText;
}

/**
 * Retrieves the Unicode representation of the image as an array of rows.
 *
 * @param {HTMLElement} container - The container element containing the Unicode representation.
 * @return {Array<Array<Object<color, text>>>} An array of rows, where each row is an array of objects containing the color and text of each Unicode character.
 */
function getUnicodeAsRows(container) {
    const spans = container.querySelectorAll('span');
    const rows = [];
    let row = [];
    for (const span of spans) {
        if (span.innerHTML === '') {
            if (row.length !== 0)
                rows.push(row);
            row = [];
            continue;
        }
        const rgbValues = getRGBValues(span);
        const hexValue = rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b);
        const stack = { color: hexValue, text: span.textContent };
        row.push(stack);
    }
    return rows;
}

/**
 * Retrieves the RGB values from the style color property of the given element.
 *
 * @param {HTMLElement} element - The element to extract the RGB values from.
 * @return {Object<r, g, b>|null} An object containing the RGB values, or null if the style color property does not match the expected format.
 */
function getRGBValues(element) {
    const match = element.style.color.match(
        /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
    );
    if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        return { r, g, b };
    }
    return null;
}

/**
 * Converts RGB values to a hexadecimal color code.
 *
 * @param {number} r - The red component of the color.
 * @param {number} g - The green component of the color.
 * @param {number} b - The blue component of the color.
 * @return {string} The hexadecimal color code.
 */
function rgbToHex(r, g, b) {
    const toHex = (color) => {
        const hex = color.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
};
