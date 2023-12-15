import Quill from "quill";
import BlotFormatter from "quill-blot-resizer";
import { QuillReference } from "./interfaces/quill-reference";
import Delta from "quill-delta";

export function bootstrap() {
    window.Spillgebees = window.Spillgebees || {};
    window.Spillgebees.fonts = window.Spillgebees.fonts || new Set();
    window.Spillgebees.editorFunctions = window.Spillgebees.editorFunctions || {
        createEditor: createEditor,
        setEditorEnabledState: setEditorEnabledState,
        getContents: getContents,
        setContents: setContents,
        getHtml: getHtml,
        setHtml: setHtml,
        getText: getText,
        insertImage: insertImage
    };
}

const createEditor = (
    quillContainer: Element,
    toolbar: any,
    isEditorEnabled?: boolean,
    placeholder?: string | undefined,
    theme?: string | undefined,
    debugLevel?: string | boolean | undefined,
    fonts: string[] = new Array<string>): void => {

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

    new Quill(quillContainer, quillOptions);
};

const setEditorEnabledState = (quillReference: QuillReference, isEditorEnabled: boolean): void => quillReference.__quill.enable(isEditorEnabled);

const getHtml = (quillReference: QuillReference): string => quillReference.__quill.root.innerHTML;

const setHtml = (quillReference: QuillReference, htmlContent: string): string => quillReference.__quill.root.innerHTML = htmlContent;

const getContents = (quillReference: QuillReference): string => JSON.stringify(quillReference.__quill.getContents());

const setContents = (quillReference: QuillReference, content: string) => quillReference.__quill.setContents(JSON.parse(content), 'api');

const getText = (quillReference: QuillReference): string => quillReference.__quill.getText();

const insertImage = (quillReference: QuillReference, imageUrl: string) => {
    let editorIndex = quillReference.__quill.getSelection()?.index ?? 0;
    return quillReference.__quill.updateContents(
        new Delta()
            .retain(editorIndex)
            .insert(
                {image: imageUrl},
                {alt: imageUrl}
            ));
};
