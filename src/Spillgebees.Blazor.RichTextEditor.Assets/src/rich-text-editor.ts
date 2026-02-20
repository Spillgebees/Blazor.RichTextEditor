import BlotFormatter2 from "@enzedonline/quill-blot-formatter2";
import type { DotNet } from "@microsoft/dotnet-js-interop";
import type { StyleAttributor } from "parchment";
import Quill, { type EmitterSource, type Range } from "quill";
import Delta from "quill-delta";
import { debounce } from "./debouncer";
import type { QuillEvent } from "./interfaces/quill-events";
import { SelectionChangedEvent, TextChangedEvent } from "./interfaces/quill-events";
import type { QuillEventNames } from "./interfaces/spillgebees";

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
    registerQuillEventCallback: registerQuillEventCallback,
  };
  window.Spillgebees.eventMap =
    window.Spillgebees.eventMap ||
    new Map<HTMLElement, Map<QuillEventNames, (...args: unknown[]) => Promise<QuillEvent>>>();
  window.Spillgebees.editors = window.Spillgebees.editors || new Map<HTMLElement, Quill>();
}

const createEditor = async (
  dotNetHelper: DotNet.DotNetObject,
  invokableDotNetMethodName: string,
  quillContainer: HTMLElement,
  toolbar: unknown,
  isEditorEnabled: boolean,
  shouldRegisterEventCallbacks: boolean,
  placeholder?: string | undefined,
  theme?: string | undefined,
  debugLevel?: string | boolean | undefined,
  fonts: string[] = [] as string[],
  eventDebounceIntervalInMilliseconds: number = 500,
  useAccessibleKeybindings: boolean = true,
): Promise<void> => {
  Quill.register("modules/blotFormatter2", BlotFormatter2);

  if (fonts.length > 0) {
    window.Spillgebees.fonts = [...window.Spillgebees.fonts, ...fonts];
    const fontAttributor = Quill.import("formats/font") as StyleAttributor;
    fontAttributor.whitelist = window.Spillgebees.fonts;
    Quill.register(fontAttributor, true);
  }

  let customKeybindings = {};
  if (useAccessibleKeybindings) {
    customKeybindings = {
      // disables indenting with a tab character in favour of tabbing out of the component for accessibility
      tab: null,
    };
  }

  const quillOptions: Record<string, unknown> = {
    modules: {
      keyboard: {
        bindings: customKeybindings,
      },
      toolbar: toolbar,
      blotFormatter2: {
        image: {
          allowAltTitleEdit: false,
        },
      },
    },
    placeholder: placeholder,
    readOnly: !isEditorEnabled,
    theme: theme,
    debug: debugLevel,
  };

  const quill = new Quill(quillContainer, quillOptions);
  window.Spillgebees.editors.set(quillContainer, quill);
  window.Spillgebees.eventMap.set(
    quillContainer,
    new Map<QuillEventNames, (...args: unknown[]) => Promise<QuillEvent>>(),
  );

  if (shouldRegisterEventCallbacks) {
    await registerQuillEventCallback(
      quillContainer,
      quill,
      "OnContentChangedAsync",
      "text-change",
      dotNetHelper,
      eventDebounceIntervalInMilliseconds,
    );
    await registerQuillEventCallback(
      quillContainer,
      quill,
      "OnSelectionChangedAsync",
      "selection-change",
      dotNetHelper,
      eventDebounceIntervalInMilliseconds,
    );
  }

  await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName);
};

const getContent = (quillContainer: HTMLElement): string | undefined =>
  window.Spillgebees.editors.get(quillContainer)?.root.innerHTML;
const setContent = (quillContainer: HTMLElement, content: string) => {
  const quill = window.Spillgebees.editors.get(quillContainer);
  if (quill === undefined) {
    return;
  }

  const delta = quill.clipboard.convert({
    html: content,
  });
  quill.setContents(delta, "api");
};

const getSelection = (quillContainer: HTMLElement): Range | null | undefined =>
  window.Spillgebees.editors.get(quillContainer)?.getSelection();
const setSelection = (quillContainer: HTMLElement, range: Range) =>
  window.Spillgebees.editors.get(quillContainer)?.setSelection(range);

const getText = (quillContainer: HTMLElement): string | undefined =>
  window.Spillgebees.editors.get(quillContainer)?.getText();

const insertImage = (quillContainer: HTMLElement, imageUrl: string) => {
  const quill = window.Spillgebees.editors.get(quillContainer);
  if (quill === undefined) {
    return;
  }

  const editorIndex = quill.getSelection()?.index ?? 0;
  return quill.updateContents(new Delta().retain(editorIndex).insert({ image: imageUrl }, { alt: imageUrl }));
};

const setEditorEnabledState = (quillContainer: HTMLElement, isEditorEnabled: boolean): void =>
  window.Spillgebees.editors.get(quillContainer)?.enable(isEditorEnabled);

const disposeEditor = (quillContainer: HTMLElement): void => {
  if (
    window.Spillgebees.editors.get(quillContainer) === undefined ||
    !window.Spillgebees.eventMap.has(quillContainer)
  ) {
    return;
  }

  if (window.Spillgebees.eventMap.get(quillContainer)?.has("text-change")) {
    const textChangeHandler = window.Spillgebees.eventMap.get(quillContainer)!.get("text-change");
    window.Spillgebees.editors.get(quillContainer)!.off("text-change", textChangeHandler);
  }

  if (window.Spillgebees.eventMap.get(quillContainer)?.has("selection-change")) {
    const selectionChangeHandler = window.Spillgebees.eventMap.get(quillContainer)!.get("selection-change");
    window.Spillgebees.editors.get(quillContainer)!.off("selection-change", selectionChangeHandler);
  }

  window.Spillgebees.eventMap.delete(quillContainer);
  window.Spillgebees.editors.delete(quillContainer);
};

const registerQuillEventCallback = async (
  quillContainer: HTMLElement,
  quill: Quill,
  invokableDotNetMethodName: string,
  eventName: QuillEventNames,
  dotNetHelper: DotNet.DotNetObject,
  debounceIntervalInMilliseconds: number,
) => {
  if (
    window.Spillgebees.eventMap.has(quillContainer) &&
    window.Spillgebees.eventMap.get(quillContainer)?.has(eventName)
  ) {
    throw new Error(`Event already registered: ${eventName}`);
  }

  if (eventName === "text-change") {
    const handler = async (_delta: Delta, _oldContents: Delta, source: EmitterSource): Promise<QuillEvent> =>
      await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new TextChangedEvent(source));
    const debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);

    window.Spillgebees.eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
    quill.on("text-change", debouncedHandler);
  } else if (eventName === "selection-change") {
    const handler = async (range: Range, oldRange: Range, source: EmitterSource): Promise<QuillEvent> =>
      await dotNetHelper.invokeMethodAsync(
        invokableDotNetMethodName,
        new SelectionChangedEvent(oldRange, range, source),
      );

    const debouncedHandler = debounce(handler, debounceIntervalInMilliseconds);
    window.Spillgebees.eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
    quill.on("selection-change", debouncedHandler);
  } else {
    throw new Error(`Invalid eventName: ${eventName}`);
  }
};
