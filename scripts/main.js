import { AppState } from './appState.js';
import { imageToUnicode } from './imageConverter.js';
import { convertUnicode } from './unicodeConverter.js';

const appState = new AppState(updateDisplay);

function updateDisplay() {
    if (appState.state.imageSelected === false)
        return;
    const unicodeHtmlNode = imageToUnicode(appState.canvas, appState.ctx, appState.image, appState.state.zoomFactor, appState.state.fullChar, appState.state.transChar, appState.elements.showLinkElem.checked);
    appState.elements.unicodeResultElem.innerHTML = unicodeHtmlNode.outerHTML;
}

window.handleCopyButtonClick = (event) => {
    const convertedText = convertUnicode(appState.elements.unicodeResultElem);
    navigator.clipboard.writeText(convertedText);
};

window.handleImageUpload = (event) => {
    const file = event.target.files[0];
    event.target.blur();
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => (appState.image.src = e.target.result);
        reader.readAsDataURL(file);
        appState.state.imageSelected = true;
    }
};

window.handleImageMouseZoom = (event) => {
    if (event.ctrlKey)
        return;

    event.preventDefault();

    if (event.deltaY < 0)
        appState.state.zoomFactor -= appState.constants.ZOOM_FACTOR_CHANGE;
    else
        appState.state.zoomFactor += appState.constants.ZOOM_FACTOR_CHANGE;

    appState.state.zoomFactor = Math.min(Math.max(appState.state.zoomFactor, 1), 10);

    updateDisplay();
};

window.handleImageMouseDown = (event) => {
    if (event.button === 1) {
        event.preventDefault();
        appState.state.isMiddleMouseDown = true;
        appState.state.lastX = event.clientX;
        appState.state.lastY = event.clientY;
        appState.elements.unicodeResultElem.style.cursor = 'move';
    }
};

window.handleMouseUp = (event) => {
    if (event.button === 1) {
        appState.state.isMiddleMouseDown = false;
        appState.elements.unicodeResultElem.style.cursor = 'default';
    }
};

window.handleImageMouseMove = (event) => {
    if (appState.state.isMiddleMouseDown) {
        event.preventDefault();
        let deltaX = event.clientX - appState.state.lastX;
        let deltaY = event.clientY - appState.state.lastY;
        appState.elements.unicodeResultElem.scrollLeft -= deltaX;
        appState.elements.unicodeResultElem.scrollTop -= deltaY;
        appState.state.lastX = event.clientX;
        appState.state.lastY = event.clientY;
    }
};

window.handleImageClick = (event) => {
    if (event.button === 1)
        event.preventDefault();
};

window.handleShowLinkChange = (event) => {
    updateDisplay();
};

window.handleChangeFullCharChange = (event) => {
    appState.state.fullChar = event.target.value;
    if (appState.state.fullChar === '')
        appState.state.fullChar = '█';
    updateDisplay();
};

window.handleChangeEmptyCharChange = (event) => {
    appState.state.transChar = event.target.value;
    if (appState.state.transChar === '')
        appState.state.transChar = '⠀';
    updateDisplay();
};
