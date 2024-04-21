import Quill, { Range } from "quill";
import { QuillEvent } from "./quill-events";
import { DotNet } from "@microsoft/dotnet-js-interop";
import { QuillReference } from "./quill-reference";

interface Spillgebees {
    fonts: Array<string>;
    editorFunctions: EditorFunctions;
    eventMap: Map<HTMLElement, Map<QuillEventNames, (...args : any[]) => Promise<QuillEvent | unknown>>>;
    editors: Map<HTMLElement, Quill>;
}

interface EditorFunctions {
    createEditor(
        dotNetHelper: DotNet.DotNetObject,
        quillElement: Element,
        toolbar: any,
        isEditorEnabled: boolean,
        placeholder: string,
        theme: string,
        debugLevel: string,
        fonts: string[],
        eventDebounceIntervalInMilliseconds: number): Promise<void>;
    setEditorEnabledState(quillReference: QuillReference, isEditorEnabled: boolean): void;
    getContent(quillReference: QuillReference): string;
    setContent(quillReference: QuillReference, content: string): void;
    getSelection(quillReference: QuillReference): Range | null;
    setSelection(quillReference: QuillReference, range: Range): void;
    getText(quillReference: QuillReference): string;
    insertImage(quillReference: QuillReference, imageUrl: string): void;
    disposeEditor(quillReference: QuillReference): void;
    registerQuillEventCallback(quillReference: QuillReference, eventName: QuillEventNames, callback: (...args : any[]) => Promise<QuillEvent>): void;
}

type QuillEventNames = (typeof Quill)['events'][keyof typeof Quill.events]

export { Spillgebees, EditorFunctions, QuillEventNames };
