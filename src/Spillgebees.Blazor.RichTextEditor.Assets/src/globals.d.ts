import type { Spillgebees } from "./interfaces/spillgebees";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    Spillgebees: Spillgebees;
    hasBeforeStartBeenCalled: boolean;
    hasAfterStartedBeenCalled: boolean;
  }
}
