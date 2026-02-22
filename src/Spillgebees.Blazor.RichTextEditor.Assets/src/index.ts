// noinspection JSUnusedGlobalSymbols

import { bootstrap } from "./rich-text-editor";
import "./styles.css";

export function beforeWebStart(options: unknown) {
  if (window.hasBeforeStartBeenCalled) {
    return;
  }

  beforeStart(options);
}

export function afterWebStarted(options: unknown) {
  if (window.hasAfterStartedBeenCalled) {
    return;
  }

  afterStarted(options);
}

export function beforeWebAssemblyStart(options: unknown) {
  if (window.hasBeforeStartBeenCalled) {
    return;
  }

  beforeStart(options);
}

export function afterWebAssemblyStarted(options: unknown) {
  if (window.hasAfterStartedBeenCalled) {
    return;
  }

  afterStarted(options);
}

export function beforeServerStart(options: unknown) {
  if (window.hasBeforeStartBeenCalled) {
    return;
  }

  beforeStart(options);
}

export function afterServerStarted(options: unknown) {
  if (window.hasAfterStartedBeenCalled) {
    return;
  }

  afterStarted(options);
}

export function beforeStart(_: unknown) {
  window.hasBeforeStartBeenCalled = true;
  bootstrap();
}

export function afterStarted(_: unknown) {
  window.hasAfterStartedBeenCalled = true;
}
