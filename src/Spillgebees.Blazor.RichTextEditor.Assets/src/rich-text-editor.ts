import { StyleAttributor } from "parchment";
import Quill, { Range, EmitterSource } from "quill";
import BlotFormatter from "quill-blot-resizer";
import Delta from "quill-delta";

import { DotNet } from "@microsoft/dotnet-js-interop";
import DotNetObject = DotNet.DotNetObject;

import { QuillEvent, SelectionChangedEvent, TextChangedEvent } from "./interfaces/quill-events";
import { debounce } from "./debouncer";
import { QuillEventNames } from "./interfaces/spillgebees";


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
        || new Map<Quill, Map<QuillEventNames, (...args : any[]) => Promise<QuillEvent>>>();
    window.Spillgebees.editors = window.Spillgebees.editors || new Map<HTMLElement, Quill>();
}

const createEditor = async (
    dotNetHelper: DotNetObject,
    invokableDotNetMethodName: string,
    quillContainer: HTMLElement,
    toolbar: any,
    isEditorEnabled: boolean,
    shouldRegisterEventCallbacks: boolean,
    placeholder?: string | undefined,
    theme?: string | undefined,
    debugLevel?: string | boolean | undefined,
    fonts: string[] = new Array<string>,
    eventDebounceIntervalInMilliseconds: number = 500): Promise<void> => {

    // Quill.register('modules/blotFormatter', BlotFormatter);

    if (fonts.length > 0)
    {
        window.Spillgebees.fonts = [...window.Spillgebees.fonts, ...fonts];
        let fontAttributor=  Quill.import('formats/font') as StyleAttributor;
        fontAttributor.whitelist = window.Spillgebees.fonts;
        Quill.register(fontAttributor, true);
    }

    let quillOptions: any ={
        modules: {
            toolbar: toolbar,
            // blotFormatter: {}
        },
        placeholder: placeholder,
        readOnly: !isEditorEnabled,
        theme: theme,
        debug: debugLevel,
    };

    const quill = new Quill(quillContainer, quillOptions);
    window.Spillgebees.editors.set(quillContainer, quill);
    window.Spillgebees.eventMap.set(quillContainer, new Map<QuillEventNames, (...args : any[]) => Promise<QuillEvent>>());

    if (shouldRegisterEventCallbacks)
    {
        await registerQuillEventCallback(
            quillContainer,
            quill,
            "OnContentChangedAsync",
            "text-change",
            dotNetHelper,
            eventDebounceIntervalInMilliseconds);
        await registerQuillEventCallback(
            quillContainer,
            quill,
            "OnSelectionChangedAsync",
            "selection-change",
            dotNetHelper,
            eventDebounceIntervalInMilliseconds);
    }

    await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName);
};

const getContent = (quillContainer: HTMLElement): string | undefined => window.Spillgebees.editors.get(quillContainer)?.root.innerHTML;
const setContent = (quillContainer: HTMLElement, content: string) => {
    let quill = window.Spillgebees.editors.get(quillContainer);
    if (quill === undefined) {
        return;
    }

    let delta = quill.clipboard.convert({
        html: content
    });
    quill.setContents(delta, 'api')
};

const getSelection = (quillContainer: HTMLElement): Range | null | undefined => window.Spillgebees.editors.get(quillContainer)?.getSelection();
const setSelection = (quillContainer: HTMLElement, range: Range) => window.Spillgebees.editors.get(quillContainer)?.setSelection(range);

const getText = (quillContainer: HTMLElement): string | undefined => window.Spillgebees.editors.get(quillContainer)?.getText();

const insertImage = (quillContainer: HTMLElement, imageUrl: string) => {
    let quill = window.Spillgebees.editors.get(quillContainer);
    if (quill === undefined) {
        return;
    }

    let editorIndex = quill.getSelection()?.index ?? 0;
    return quill.updateContents(
        new Delta()
            .retain(editorIndex)
            .insert(
                {image: imageUrl},
                {alt: imageUrl}
            ));
};

const setEditorEnabledState = (quillContainer: HTMLElement, isEditorEnabled: boolean): void => window.Spillgebees.editors.get(quillContainer)?.enable(isEditorEnabled);

const disposeEditor = (quillContainer: HTMLElement): void => {
    if (window.Spillgebees.editors.get(quillContainer) === undefined
        || !window.Spillgebees.eventMap.has(quillContainer)) {
        return;
    }

    if (window.Spillgebees.eventMap.get(quillContainer)?.has("text-change")) {
        let textChangeHandler = window.Spillgebees.eventMap.get(quillContainer)!.get("text-change");
        window.Spillgebees.editors.get(quillContainer)!.off("text-change", textChangeHandler);
    }

    if (window.Spillgebees.eventMap.get(quillContainer)?.has("selection-change")) {
        let selectionChangeHandler = window.Spillgebees.eventMap.get(quillContainer)!.get("selection-change");
        window.Spillgebees.editors.get(quillContainer)!.off("selection-change", selectionChangeHandler);
    }

    window.Spillgebees.eventMap.delete(quillContainer);
    window.Spillgebees.editors.delete(quillContainer);
}

const registerQuillEventCallback = async (
    quillContainer: HTMLElement,
    quill: Quill,
    invokableDotNetMethodName: string,
    eventName: QuillEventNames,
    dotNetHelper: DotNetObject,
    debounceIntervalInMilliseconds: number) => {
    if (window.Spillgebees.eventMap.has(quillContainer) && window.Spillgebees.eventMap.get(quillContainer)?.has(eventName)) {
        throw new Error(`Event already registered: ${eventName}`);
    }

    if (eventName === "text-change") {
        let handler = async (
            _delta: Delta,
            _oldContents: Delta,
            source: EmitterSource): Promise<QuillEvent> => await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new TextChangedEvent(source));
        let debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);

        window.Spillgebees.eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
        quill.on("text-change", debouncedHandler);
    }
    else if (eventName === "selection-change") {
        let handler = async (
            range: Range,
            oldRange: Range,
            source: EmitterSource): Promise<QuillEvent> => await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new SelectionChangedEvent(oldRange, range, source));

        let debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);
        window.Spillgebees.eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
        quill.on("selection-change", debouncedHandler);
    }
    else {
        throw new Error(`Invalid eventName: ${eventName}`);
    }
}
