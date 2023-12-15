using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

internal static class RichTextEditorJs
{
    private const string JsNamespace = "Spillgebees.editorFunctions";

    internal static ValueTask<object> CreateEditor(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        ElementReference toolbar,
        bool isEditorEnabled,
        string placeholder,
        string theme,
        string debugLevel,
        List<string>? fonts)
        => jsRuntime.InvokeAsync<object>(
            $"{JsNamespace}.createEditor",
            quillReference,
            toolbar,
            isEditorEnabled,
            placeholder,
            theme,
            debugLevel,
            fonts);

    internal static ValueTask<string> GetContent(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.InvokeAsync<string>(
            $"{JsNamespace}.getContent",
            quillReference);

    internal static ValueTask<object> SetContent(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        string content)
        => jsRuntime.InvokeAsync<object>(
            $"{JsNamespace}.setContent",
            quillReference,
            content);

    internal static ValueTask<string> GetHtml(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.InvokeAsync<string>(
            $"{JsNamespace}.getHtml",
            quillReference);

    internal static ValueTask<object> SetHtml(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        string html)
        => jsRuntime.InvokeAsync<object>(
            $"{JsNamespace}.setHtml",
            quillReference,
            html);

    internal static ValueTask<string> GetText(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.InvokeAsync<string>(
            $"{JsNamespace}.getText",
            quillReference);

    internal static ValueTask<object> SetIsEditorEnabled(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        bool isEditorEnabled)
        => jsRuntime.InvokeAsync<object>(
            $"{JsNamespace}.setEditorEnabledState",
            quillReference,
            isEditorEnabled);

    internal static ValueTask<object> InsertImage(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        string imageSource)
        => jsRuntime.InvokeAsync<object>(
            $"{JsNamespace}.insertImage",
            quillReference,
            imageSource);
}
