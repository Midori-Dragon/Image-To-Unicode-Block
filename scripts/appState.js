export class AppState {
    constructor(updateAction) {
        this.elements = {};
        this.constants = {
            ZOOM_FACTOR_CHANGE: 0.25
        };
        this.state = {
            fullChar: '█',
            transChar: '⠀',
            zoomFactor: 4,
            isMiddleMouseDown: false,
            lastX: 0,
            lastY: 0,
            imageSelected: false
        };
        this.image = new Image();
        this.image.onload = updateAction;
        this.canvas = document.createElement('canvas');

        document.addEventListener('DOMContentLoaded', () => {
            const elementMapping = {
                'unicode-result': 'unicodeResultElem',
                'template-string': 'templateStringElem',
                'show-link': 'showLinkElem',
                'conversion-char-full': 'pixelCharFullElem',
                'conversion-char-trans': 'pixelCharTransElem'
            };
            Object.keys(elementMapping).forEach(id => {
                const propName = elementMapping[id];
                this.elements[propName] = document.getElementById(id);
            });

            this.ctx = this.canvas.getContext('2d');

            this.state.fullChar = this.elements.pixelCharFullElem.value;
            this.state.transChar = this.elements.pixelCharTransElem.value;
        });
    }
};
