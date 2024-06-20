/**
 * Represents the state of the application.
 */
class AppState {
    constructor() {
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
            imageSelected: false,
            transThreshold: 50
        };
        this.image = new Image();
        this.canvas = document.createElement('canvas');

        const handler = {
            set: (obj, prop, value) => {
                obj[prop] = value;
                if (prop !== '_events')
                    obj._events[prop]?.forEach(event => event(value));
                return true;
            }
        };

        this.state = new Proxy(this.state, handler);
        this.state._events = {};
        this.onPropertyChange = (prop, callback) => {
            if (!this.state._events[prop])
                this.state._events[prop] = [];
            this.state._events[prop].push(callback);
        };

        document.addEventListener('DOMContentLoaded', () => {
            const elementMapping = {
                'unicode-result': 'unicodeResultElem',
                'template-string': 'templateStringElem',
                'show-link': 'showLinkElem',
                'conversion-char-full': 'pixelCharFullElem',
                'conversion-char-trans': 'pixelCharTransElem',
                'trans-slider': 'transSliderElem',
            };
            Object.keys(elementMapping).forEach(id => {
                const propName = elementMapping[id];
                this.elements[propName] = document.getElementById(id);
            });

            this.ctx = this.canvas.getContext('2d');

            this.state.fullChar = this.elements.pixelCharFullElem.value;
            this.state.transChar = this.elements.pixelCharTransElem.value;

            this.elements.transSliderElem.value = this.state.transThreshold;
        });
    }

    /**
     * Sets a callback function to be called when the image is loaded.
     *
     * @param {function} action - The callback function to be called.
     */
    onloadImage(action) {
        this.image.onload = action;
    }
};
export const appState = new AppState();
