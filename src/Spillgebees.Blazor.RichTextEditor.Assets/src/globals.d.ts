import type { RichTextEditorNamespace } from "./interfaces/rich-text-editor";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    Spillgebees: {
      RichTextEditor: RichTextEditorNamespace;
    };
    hasBeforeStartBeenCalledForSpillgebeesRichTextEditor: boolean;
    hasAfterStartedBeenCalledForSpillgebeesRichTextEditor: boolean;
  }
}
