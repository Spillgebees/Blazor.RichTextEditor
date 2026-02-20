import type { DotNet } from "@microsoft/dotnet-js-interop";
import type Quill from "quill";
import type { Range } from "quill";
import type { QuillEvent } from "./quill-events";

interface Spillgebees {
  fonts: Array<string>;
  editorFunctions: EditorFunctions;
  eventMap: Map<HTMLElement, Map<QuillEventNames, (...args: unknown[]) => Promise<QuillEvent | unknown>>>;
  editors: Map<HTMLElement, Quill>;
}

interface EditorFunctions {
  createEditor(
    dotNetHelper: DotNet.DotNetObject,
    quillElement: Element,
    toolbar: unknown,
    isEditorEnabled: boolean,
    placeholder: string,
    theme: string,
    debugLevel: string,
    fonts: string[],
    eventDebounceIntervalInMilliseconds: number,
    useAccessibleKeybindings: boolean,
  ): Promise<void>;
  setEditorEnabledState(quillContainer: HTMLElement, isEditorEnabled: boolean): void;
  getContent(quillContainer: HTMLElement): string;
  setContent(quillContainer: HTMLElement, content: string): void;
  getSelection(quillContainer: HTMLElement): Range | null;
  setSelection(quillContainer: HTMLElement, range: Range): void;
  getText(quillContainer: HTMLElement): string;
  insertImage(quillContainer: HTMLElement, imageUrl: string): void;
  disposeEditor(quillContainer: HTMLElement): void;
  registerQuillEventCallback(
    quillContainer: HTMLElement,
    eventName: QuillEventNames,
    callback: (...args: unknown[]) => Promise<QuillEvent>,
  ): void;
}

type QuillEventNames = (typeof Quill)["events"][keyof (typeof Quill)["events"]];

export type { Spillgebees, EditorFunctions, QuillEventNames };
