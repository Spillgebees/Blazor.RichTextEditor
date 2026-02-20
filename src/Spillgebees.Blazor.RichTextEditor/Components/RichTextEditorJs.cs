using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

internal static class RichTextEditorJs
{
    private const string JsNamespace = "Spillgebees.editorFunctions";

    internal static ValueTask CreateEditorAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        DotNetObjectReference<BaseRichTextEditor>? dotNetObjectReference,
        string onAfterCreateEditorCallback,
        ElementReference quillReference,
        ElementReference toolbar,
        bool isEditorEnabled,
        bool shouldRegisterCallbacks,
        string placeholder,
        string theme,
        string debugLevel,
        List<string>? fonts,
        int debounceIntervalInMilliseconds = 0,
        bool useAccessibleKeybindings = true
    ) =>
        jsRuntime.SafeInvokeVoidAsync(
            logger,
            $"{JsNamespace}.createEditor",
            dotNetObjectReference,
            onAfterCreateEditorCallback,
            quillReference,
            toolbar,
            isEditorEnabled,
            shouldRegisterCallbacks,
            placeholder,
            theme,
            debugLevel,
            fonts,
            debounceIntervalInMilliseconds,
            useAccessibleKeybindings
        );

    internal static ValueTask<string> GetContentAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference
    ) => jsRuntime.SafeInvokeAsync<string>(logger, $"{JsNamespace}.getContent", quillReference);

    internal static ValueTask SetContentAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference,
        string content
    ) => jsRuntime.SafeInvokeVoidAsync(logger, $"{JsNamespace}.setContent", quillReference, content);

    internal static ValueTask<Range?> GetSelectionAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference
    ) => jsRuntime.SafeInvokeAsync<Range?>(logger, $"{JsNamespace}.getSelection", quillReference);

    internal static ValueTask SetSelectionAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference,
        Range? range
    ) => jsRuntime.SafeInvokeVoidAsync(logger, $"{JsNamespace}.setSelection", quillReference, range);

    internal static ValueTask<string> GetTextAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference
    ) => jsRuntime.SafeInvokeAsync<string>(logger, $"{JsNamespace}.getText", quillReference);

    internal static ValueTask<object> InsertImageAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference,
        string imageSource
    ) => jsRuntime.SafeInvokeAsync<object>(logger, $"{JsNamespace}.insertImage", quillReference, imageSource);

    internal static ValueTask<object> SetIsEditorEnabledAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference,
        bool isEditorEnabled
    ) =>
        jsRuntime.SafeInvokeAsync<object>(
            logger,
            $"{JsNamespace}.setEditorEnabledState",
            quillReference,
            isEditorEnabled
        );

    internal static ValueTask DisposeEditorAsync(
        IJSRuntime jsRuntime,
        ILogger logger,
        ElementReference quillReference
    ) => jsRuntime.SafeInvokeVoidAsync(logger, $"{JsNamespace}.disposeEditor", quillReference);

    private static ValueTask SafeInvokeVoidAsync(
        this IJSRuntime jsRuntime,
        ILogger logger,
        string identifier,
        params object?[] args
    )
    {
        try
        {
            return jsRuntime.InvokeVoidAsync(identifier, args);
        }
        catch (JSDisconnectedException) { }
        catch (OperationCanceledException)
        {
            logger.LogWarning("Invocation of {identifier} was cancelled.", identifier);
        }

        return ValueTask.CompletedTask;
    }

    private static ValueTask<T> SafeInvokeAsync<T>(
        this IJSRuntime jsRuntime,
        ILogger logger,
        string identifier,
        params object?[] args
    )
    {
        try
        {
            return jsRuntime.InvokeAsync<T>(identifier, args);
        }
        catch (JSDisconnectedException) { }
        catch (OperationCanceledException)
        {
            logger.LogWarning("Invocation of {identifier} was cancelled.", identifier);
        }

        return ValueTask.FromResult(default(T)!);
    }
}
