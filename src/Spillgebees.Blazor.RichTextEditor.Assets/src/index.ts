// noinspection JSUnusedGlobalSymbols

import { bootstrap } from "./rich-text-editor";
import './styles.css';

export function beforeWebStart(options: any) {
    if (window.hasBeforeStartBeenCalled) {
        return;
    }

    beforeStart(options);
}

export function afterWebStarted(options: any) {
    if (window.hasAfterStartedBeenCalled) {
        return;
    }

    afterStarted(options);
}

export function beforeWebAssemblyStart(options: any) {
    if (window.hasBeforeStartBeenCalled) {
        return;
    }

    beforeStart(options);
}

export function afterWebAssemblyStarted(options: any) {
    if (window.hasAfterStartedBeenCalled) {
        return
    }

    afterStarted(options);
}

export function beforeServerStart(options: any) {
    if (window.hasBeforeStartBeenCalled) {
        return;
    }

    beforeStart(options);
}

export function afterServerStarted(options: any) {
    if (window.hasAfterStartedBeenCalled) {
        return;
    }

    afterStarted(options);
}

export function beforeStart(_: any) {
    window.hasBeforeStartBeenCalled = true;
    bootstrap();
}

export function afterStarted(_: any) {
    window.hasAfterStartedBeenCalled = true;
}
