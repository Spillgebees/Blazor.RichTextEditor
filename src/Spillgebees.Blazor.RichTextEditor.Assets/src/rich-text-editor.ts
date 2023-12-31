import Quill, { RangeStatic, SelectionChangeHandler, Sources, TextChangeHandler } from "quill";
import BlotFormatter from "quill-blot-resizer";
import Delta from "quill-delta";

import { DotNet } from "@microsoft/dotnet-js-interop";
import DotNetObject = DotNet.DotNetObject;

import { QuillReference } from "./interfaces/quill-reference";
import { QuillEvent, SelectionChangedEvent, TextChangedEvent } from "./interfaces/quill-events";
import { debounce } from "./debouncer";

export function bootstrap() {
    window.Spillgebees = window.Spillgebees || {};
    window.Spillgebees.fonts = window.Spillgebees.fonts || new Set();
    window.Spillgebees.editorFunctions = window.Spillgebees.editorFunctions || {
        createEditor: createEditor,
        setEditorEnabledState: setEditorEnabledState,
        getContent: getContent,
        setContent: setContent,
        getSelection: getSelection,
        setSelection: setSelection,
        getText: getText,
        insertImage: insertImage,
        disposeEditor: disposeEditor,
        registerQuillEventCallback: registerQuillEventCallback
    };
    window.Spillgebees.eventMap = window.Spillgebees.eventMap
        || new Map<Quill, Map<"text-change" | "selection-change", (...args : any[]) => Promise<QuillEvent>>>();
}

const createEditor = async (
    dotNetHelper: DotNetObject,
    invokableDotNetMethodName: string,
    quillContainer: Element,
    toolbar: any,
    isEditorEnabled: boolean,
    shouldRegisterEventCallbacks: boolean,
    placeholder?: string | undefined,
    theme?: string | undefined,
    debugLevel?: string | boolean | undefined,
    fonts: string[] = new Array<string>,
    eventDebounceIntervalInMilliseconds: number = 500): Promise<void> => {

    Quill.register('modules/blotFormatter', BlotFormatter);

    if (fonts.length > 0)
    {
        window.Spillgebees.fonts = [...window.Spillgebees.fonts, ...fonts];
        let fontAttributor = Quill.import('formats/font');
        fontAttributor.whitelist = window.Spillgebees.fonts;
        Quill.register(fontAttributor, true);
    }

    let quillOptions: any ={
        modules: {
            toolbar: toolbar,
            blotFormatter: {}
        },
        placeholder: placeholder,
        readOnly: !isEditorEnabled,
        theme: theme,
        debug: debugLevel,
    };

    let quill = new Quill(quillContainer, quillOptions);
    window.Spillgebees.eventMap.set(quill, new Map<"text-change" | "selection-change", (delta: Delta, oldContents: Delta, source: Sources) => Promise<QuillEvent>>());

    if (shouldRegisterEventCallbacks)
    {
        await registerQuillEventCallback(
            quill,
            "OnContentChangedAsync",
            "text-change",
            dotNetHelper,
            eventDebounceIntervalInMilliseconds);
        await registerQuillEventCallback(
            quill,
            "OnSelectionChangedAsync",
            "selection-change",
            dotNetHelper,
            eventDebounceIntervalInMilliseconds);
    }

    await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName);
};

const getContent = (quillReference: QuillReference | null): string | undefined => quillReference?.__quill?.root.innerHTML;
// @ts-ignore
const setContent = (quillReference: QuillReference | null, content: string) => quillReference?.__quill?.setContents(quillReference.__quill.clipboard.convert(content), 'api');

const getSelection = (quillReference: QuillReference | null): RangeStatic | null | undefined => quillReference?.__quill?.getSelection();
const setSelection = (quillReference: QuillReference | null, range: RangeStatic) => quillReference?.__quill?.setSelection(range);

const getText = (quillReference: QuillReference | null): string | undefined => quillReference?.__quill?.getText();

const insertImage = (quillReference: QuillReference | null, imageUrl: string) => {
    if (quillReference === null || quillReference.__quill === null) {
        return;
    }

    let editorIndex = quillReference.__quill?.getSelection()?.index ?? 0;
    return quillReference.__quill?.updateContents(
        new Delta()
            .retain(editorIndex)
            .insert(
                {image: imageUrl},
                {alt: imageUrl}
            ));
};

const setEditorEnabledState = (quillReference: QuillReference | null, isEditorEnabled: boolean): void => quillReference?.__quill?.enable(isEditorEnabled);

const disposeEditor = (quillReference: QuillReference | null): void => {
    if (quillReference === null
        || quillReference.__quill === null
        || !window.Spillgebees.eventMap.has(quillReference.__quill)) {
        return;
    }

    if (window.Spillgebees.eventMap.get(quillReference.__quill)?.has("text-change")) {
        let textChangeHandler = window.Spillgebees.eventMap.get(quillReference.__quill)!.get("text-change");
        quillReference.__quill.off("text-change", textChangeHandler as TextChangeHandler);
    }

    if (window.Spillgebees.eventMap.get(quillReference.__quill)?.has("selection-change")) {
        let selectionChangeHandler = window.Spillgebees.eventMap.get(quillReference.__quill)!.get("selection-change");
        quillReference.__quill.off("selection-change", selectionChangeHandler as SelectionChangeHandler);
    }

    window.Spillgebees.eventMap.delete(quillReference.__quill);
    quillReference.__quill = null;
}

const registerQuillEventCallback = async (
    quill: Quill,
    invokableDotNetMethodName:  string,
    eventName: "text-change" | "selection-change",
    dotNetHelper: DotNetObject,
    debounceIntervalInMilliseconds: number) => {
    if (window.Spillgebees.eventMap.has(quill) && window.Spillgebees.eventMap.get(quill)?.has(eventName)) {
        throw new Error(`Event already registered: ${eventName}`);
    }

    if (eventName === "text-change") {
        let handler = async (
            _delta: Delta,
            _oldContents: Delta,
            source: Sources): Promise<QuillEvent> => await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new TextChangedEvent(source));
        let debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);

        window.Spillgebees.eventMap.get(quill)?.set(eventName, debouncedHandler);
        quill.on("text-change", debouncedHandler);
    }
    else if (eventName === "selection-change") {
        let handler = async (
            range: RangeStatic,
            oldRange: RangeStatic,
            source: Sources): Promise<QuillEvent> => await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new SelectionChangedEvent(oldRange, range, source));

        let debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);
        window.Spillgebees.eventMap.get(quill)?.set(eventName, debouncedHandler);
        quill.on("selection-change", debouncedHandler);
    }
    else {
        throw new Error(`Invalid eventName: ${eventName}`);
    }
}
