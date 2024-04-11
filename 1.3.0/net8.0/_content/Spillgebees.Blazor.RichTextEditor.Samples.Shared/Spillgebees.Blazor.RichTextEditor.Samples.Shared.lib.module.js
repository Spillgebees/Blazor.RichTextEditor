// noinspection JSUnusedGlobalSymbols

let hasBeforeStartBeenCalled = false;

export function beforeWebStart() {
    beforeStart();
}


export function beforeWebAssemblyStart() {
    beforeStart();
}

export function beforeServerStart() {
    beforeStart();
}

export function beforeStart() {
    if (hasBeforeStartBeenCalled) {
        return;
    }
    hasBeforeStartBeenCalled = true;

    window.Samples = window.Samples || {};
    window.Samples.Shared = window.Samples.Shared || {
        highlightElement: function (content, element) {
            delete element.dataset.highlighted;
            element.textContent = content;
            // noinspection JSUnresolvedReference
            hljs.highlightElement(element);
        }
    };
}
