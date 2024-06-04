export function convertUnicode(container) {
    let templateString = templateStringElem.value;
    if (templateString === '')
        templateString = '[color=${color}]${text}[/color]';

    let rows = getUnicodeAsRows(container);
    let convertedText = '';
    for (const row of rows) {
        for (const stack of row) {
            convertedText += templateString.replace(/\$\{color\}/g, stack.color).replace(/\$\{text\}/g, stack.text);;
        }
        convertedText += '\n';
    }
    return convertedText;
}

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

function rgbToHex(r, g, b) {
    const toHex = (color) => {
        const hex = color.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}
