import BlotFormatter2 from "@enzedonline/quill-blot-formatter2";
import type { DotNet } from "@microsoft/dotnet-js-interop";
import type { StyleAttributor } from "parchment";
import Quill, { type EmitterSource, type Range } from "quill";
import Delta from "quill-delta";
import { debounce } from "./debouncer";
import type { QuillEvent } from "./interfaces/quill-events";
import { SelectionChangedEvent, TextChangedEvent } from "./interfaces/quill-events";
import type { QuillEventHandler, QuillEventNames, RichTextEditorNamespace } from "./interfaces/rich-text-editor";

export function bootstrap() {
  window.Spillgebees = window.Spillgebees || ({} as Window["Spillgebees"]);
  window.Spillgebees.RichTextEditor =
    window.Spillgebees.RichTextEditor ||
    ({
      fonts: new Set(),
      eventMap: new Map<HTMLElement, Map<QuillEventNames, QuillEventHandler>>(),
      editors: new Map<HTMLElement, Quill>(),
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
    } satisfies RichTextEditorNamespace);
}

const namespace = (): RichTextEditorNamespace => window.Spillgebees.RichTextEditor;

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
    for (const font of fonts) {
      namespace().fonts.add(font);
    }
    const fontAttributor = Quill.import("formats/font") as StyleAttributor;
    fontAttributor.whitelist = Array.from(namespace().fonts);
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
  namespace().editors.set(quillContainer, quill);
  namespace().eventMap.set(quillContainer, new Map<QuillEventNames, QuillEventHandler>());

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
  namespace().editors.get(quillContainer)?.root.innerHTML;
const setContent = (quillContainer: HTMLElement, content: string) => {
  const quill = namespace().editors.get(quillContainer);
  if (quill === undefined) {
    return;
  }

  const delta = quill.clipboard.convert({
    html: content,
  });
  quill.setContents(delta, "api");
};

const getSelection = (quillContainer: HTMLElement): Range | null | undefined =>
  namespace().editors.get(quillContainer)?.getSelection();
const setSelection = (quillContainer: HTMLElement, range: Range) =>
  namespace().editors.get(quillContainer)?.setSelection(range);

const getText = (quillContainer: HTMLElement): string | undefined => namespace().editors.get(quillContainer)?.getText();

const insertImage = (quillContainer: HTMLElement, imageUrl: string) => {
  const quill = namespace().editors.get(quillContainer);
  if (quill === undefined) {
    return;
  }

  const editorIndex = quill.getSelection()?.index ?? 0;
  return quill.updateContents(new Delta().retain(editorIndex).insert({ image: imageUrl }, { alt: imageUrl }));
};

const setEditorEnabledState = (quillContainer: HTMLElement, isEditorEnabled: boolean): void =>
  namespace().editors.get(quillContainer)?.enable(isEditorEnabled);

const disposeEditor = (quillContainer: HTMLElement): void => {
  if (namespace().editors.get(quillContainer) === undefined || !namespace().eventMap.has(quillContainer)) {
    return;
  }

  if (namespace().eventMap.get(quillContainer)?.has("text-change")) {
    const textChangeHandler = namespace().eventMap.get(quillContainer)!.get("text-change");
    namespace().editors.get(quillContainer)!.off("text-change", textChangeHandler);
  }

  if (namespace().eventMap.get(quillContainer)?.has("selection-change")) {
    const selectionChangeHandler = namespace().eventMap.get(quillContainer)!.get("selection-change");
    namespace().editors.get(quillContainer)!.off("selection-change", selectionChangeHandler);
  }

  namespace().eventMap.delete(quillContainer);
  namespace().editors.delete(quillContainer);
};

const registerQuillEventCallback = async (
  quillContainer: HTMLElement,
  quill: Quill,
  invokableDotNetMethodName: string,
  eventName: QuillEventNames,
  dotNetHelper: DotNet.DotNetObject,
  debounceIntervalInMilliseconds: number,
) => {
  if (namespace().eventMap.has(quillContainer) && namespace().eventMap.get(quillContainer)?.has(eventName)) {
    throw new Error(`Event already registered: ${eventName}`);
  }

  if (eventName === "text-change") {
    const handler = async (_delta: Delta, _oldContents: Delta, source: EmitterSource): Promise<QuillEvent> =>
      await dotNetHelper.invokeMethodAsync(invokableDotNetMethodName, new TextChangedEvent(source));
    const debouncedHandler = debounce<typeof handler, QuillEvent>(handler, debounceIntervalInMilliseconds);

    namespace().eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
    quill.on("text-change", debouncedHandler);
  } else if (eventName === "selection-change") {
    const handler = async (range: Range, oldRange: Range, source: EmitterSource): Promise<QuillEvent> =>
      await dotNetHelper.invokeMethodAsync(
        invokableDotNetMethodName,
        new SelectionChangedEvent(oldRange, range, source),
      );

    const debouncedHandler = debounce<typeof handler, QuillEvent>(handler, debounceIntervalInMilliseconds);
    namespace().eventMap.get(quillContainer)?.set(eventName, debouncedHandler);
    quill.on("selection-change", debouncedHandler);
  } else {
    throw new Error(`Invalid eventName: ${eventName}`);
  }
};
