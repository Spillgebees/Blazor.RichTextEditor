import type { DotNet } from "@microsoft/dotnet-js-interop";
import type Quill from "quill";
import type { Delta, EmitterSource, Range } from "quill";
import type { QuillEvent } from "./quill-events";

interface Spillgebees {
  fonts: Set<string>;
  editorFunctions: EditorFunctions;
  eventMap: Map<HTMLElement, Map<QuillEventNames, QuillEventHandler>>;
  editors: Map<HTMLElement, Quill>;
}

interface EditorFunctions {
  createEditor(
    dotNetHelper: DotNet.DotNetObject,
    invokableDotNetMethodName: string,
    quillContainer: HTMLElement,
    toolbar: unknown,
    isEditorEnabled: boolean,
    shouldRegisterEventCallbacks: boolean,
    placeholder?: string,
    theme?: string,
    debugLevel?: string | boolean,
    fonts?: string[],
    eventDebounceIntervalInMilliseconds?: number,
    useAccessibleKeybindings?: boolean,
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
    quill: Quill,
    invokableDotNetMethodName: string,
    eventName: QuillEventNames,
    dotNetHelper: DotNet.DotNetObject,
    debounceIntervalInMilliseconds: number,
  ): Promise<void>;
}

type QuillEventNames = (typeof Quill)["events"][keyof typeof Quill.events];
type QuillEventHandler =
  | ((delta: Delta, oldContents: Delta, source: EmitterSource) => Promise<QuillEvent>)
  | ((range: Range, oldRange: Range, source: EmitterSource) => Promise<QuillEvent>);

export type { Spillgebees, EditorFunctions, QuillEventNames, QuillEventHandler };
