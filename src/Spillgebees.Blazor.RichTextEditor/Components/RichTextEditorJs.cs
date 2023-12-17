using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

internal static class RichTextEditorJs
{
    private const string JsNamespace = "Spillgebees.editorFunctions";

    internal static ValueTask CreateEditorAsync(
        IJSRuntime jsRuntime,
        DotNetObjectReference<BaseRichTextEditor>? dotNetObjectReference,
        ElementReference quillReference,
        ElementReference toolbar,
        bool isEditorEnabled,
        bool shouldRegisterCallbacks,
        string placeholder,
        string theme,
        string debugLevel,
        List<string>? fonts)
        => jsRuntime.SafeInvokeVoidAsync(
            $"{JsNamespace}.createEditor",
            dotNetObjectReference,
            quillReference,
            toolbar,
            isEditorEnabled,
            shouldRegisterCallbacks,
            placeholder,
            theme,
            debugLevel,
            fonts);

    internal static ValueTask<string> GetContentAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.SafeInvokeAsync<string>(
            $"{JsNamespace}.getContent",
            quillReference);

    internal static ValueTask SetContentAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        string content)
        => jsRuntime.SafeInvokeVoidAsync(
            $"{JsNamespace}.setContent",
            quillReference,
            content);

    internal static ValueTask<Range?> GetSelectionAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.SafeInvokeAsync<Range?>(
            $"{JsNamespace}.getSelection",
            quillReference);

    internal static ValueTask SetSelectionAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        Range? range)
        => jsRuntime.SafeInvokeVoidAsync(
            $"{JsNamespace}.setSelection",
            quillReference,
            range);

    internal static ValueTask<string> GetTextAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.SafeInvokeAsync<string>(
            $"{JsNamespace}.getText",
            quillReference);

    internal static ValueTask<object> InsertImageAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        string imageSource)
        => jsRuntime.SafeInvokeAsync<object>(
            $"{JsNamespace}.insertImage",
            quillReference,
            imageSource);

    internal static ValueTask<object> SetIsEditorEnabledAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference,
        bool isEditorEnabled)
        => jsRuntime.SafeInvokeAsync<object>(
            $"{JsNamespace}.setEditorEnabledState",
            quillReference,
            isEditorEnabled);

    internal static ValueTask<object> DisposeEditorAsync(
        IJSRuntime jsRuntime,
        ElementReference quillReference)
        => jsRuntime.SafeInvokeAsync<object>(
            $"{JsNamespace}.disposeEditor",
            quillReference);

    private static ValueTask SafeInvokeVoidAsync(
        this IJSRuntime jsRuntime,
        string identifier,
        params object?[] args)
    {
        try
        {
            return jsRuntime.InvokeVoidAsync(identifier, args);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return new ValueTask();
        }
    }

    private static ValueTask<T> SafeInvokeAsync<T>(
        this IJSRuntime jsRuntime,
        string identifier,
        params object?[] args)
    {
        try
        {
            return jsRuntime.InvokeAsync<T>(identifier, args);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return new ValueTask<T>(default(T)!);
        }
    }
}
