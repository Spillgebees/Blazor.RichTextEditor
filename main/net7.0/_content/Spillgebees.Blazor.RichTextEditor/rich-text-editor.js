// noinspection JSUnresolvedReference

const createEditor = (quillReference, toolbar, isEditorEnabled, placeholder, theme, debugLevel, fonts) => {
    Quill.register('modules/blotFormatter', QuillBlotFormatter.default);

    if (fonts.length > 0)
    {
        window.Spillgebees.Fonts= [...window.Spillgebees.Fonts, ...fonts];

        let fontAttributor = Quill.import('formats/font');
        fontAttributor.whitelist = window.Spillgebees.Fonts;
        Quill.register(fontAttributor, true);
    }

    let quillOptions ={
        modules: {
            toolbar: toolbar,
            blotFormatter: QuillBlotFormatter.DefaultOptions
        },
        placeholder: placeholder,
        readOnly: !isEditorEnabled,
        theme: theme,
        debug: debugLevel,
    };
    new Quill(quillReference, quillOptions);
};

const setEditorEnabledState = (quillReference, isEditorEnabled) => quillReference.__quill.enable(isEditorEnabled);

const getHtml = quillReference => quillReference.__quill.root.innerHTML;
const setHtml = (quillReference, htmlContent) => quillReference.__quill.root.innerHTML = htmlContent;

const getContents = quillReference => JSON.stringify(quillReference.__quill.getContents());
const setContents = (quillReference, content) => quillReference.__quill.setContents(JSON.parse(content), 'api');

const getText = quillReference => quillReference.__quill.getText();

const insertImage = (quillReference, imageUrl) => {
    const Delta = Quill.import('delta');
    let editorIndex = 0;

    if (quillReference.__quill.getSelection() !== null) {
        editorIndex = quillReference.__quill.getSelection().index;
    }

    return quillReference.__quill.updateContents(
        new Delta()
            .retain(editorIndex)
            .insert(
                {image: imageUrl},
                {alt: imageUrl}
            ));
};

// register the rich text editor functions to the global namespace
(function () {
    window.Spillgebees = window.Spillgebees || {};
    window.Spillgebees.Fonts = window.Spillgebees.Fonts || new Set();
    window.Spillgebees.EditorFunctions = window.Spillgebees.EditorFunctions || {
        createEditor: createEditor,
        setEditorEnabledState: setEditorEnabledState,
        getContents: getContents,
        setContents: setContents,
        getHtml: getHtml,
        setHtml: setHtml,
        getText: getText,
        insertImage: insertImage
    };
})();
