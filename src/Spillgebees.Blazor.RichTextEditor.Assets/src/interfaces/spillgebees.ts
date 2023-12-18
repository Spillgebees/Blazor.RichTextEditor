import { Quill, RangeStatic } from "quill";
import { QuillEvent } from "./quill-events";
import { DotNet } from "@microsoft/dotnet-js-interop";
import { QuillReference } from "./quill-reference";

interface Spillgebees {
    fonts: Array<string>;
    editorFunctions: EditorFunctions;
    eventMap: Map<Quill, Map<"text-change" | "selection-change", (...args: any[])  => Promise<QuillEvent> | QuillEvent>>;
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
    getSelection(quillReference: QuillReference): RangeStatic | null;
    setSelection(quillReference: QuillReference, range: RangeStatic): void;
    getText(quillReference: QuillReference): string;
    insertImage(quillReference: QuillReference, imageUrl: string): void;
    disposeEditor(quillReference: QuillReference): Promise<void>;
    registerQuillEventCallback(quillReference: QuillReference, eventName: "text-change" | "selection-change", callback: (...args : any[]) => Promise<QuillEvent>): void;
    deregisterQuillEventCallback(quillReference: QuillReference, eventName: "text-change" | "selection-change", callback: (...args : any[]) => Promise<QuillEvent>): void;
}

export { Spillgebees, EditorFunctions };
