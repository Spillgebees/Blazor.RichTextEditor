import { Spillgebees } from "./interfaces/spillgebees";

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface Window {
        Spillgebees: Spillgebees;
        Quill: any;
        hasBeforeStartBeenCalled: boolean;
        hasAfterStartedBeenCalled: boolean;
    }
}
