interface Spillgebees {
    fonts: Array<string>;
    editorFunctions: EditorFunctions;
}

interface EditorFunctions {
    createEditor(
        quillReference: Element,
        toolbar: any,
        isEditorEnabled: boolean,
        placeholder: string,
        theme: string,
        debugLevel: string,
        fonts: string[]): void;
}

export { Spillgebees, EditorFunctions };
