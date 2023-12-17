using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public partial class RichTextEditor : BaseRichTextEditor
{
    /// <summary>
    /// <para>
    /// Applies to <see cref="BaseRichTextEditor.ContentChanged"/>, <see cref="BaseRichTextEditor.TextChanged"/>, and <see cref="BaseRichTextEditor.SelectionChanged"/>.
    /// </para>
    /// <para>
    /// Can only be set once. Defaults to <b>500</b> milliseconds.
    /// </para>
    /// </summary>
    [Parameter]
    public int DebounceMilliseconds { get; set; } = 500;


    private Delayer? _contentDebounceDelayer;
    private Delayer? _textDebounceDelayer;
    private Delayer? _selectionDebounceDelayer;

    public override async ValueTask DisposeAsync()
    {
        if (IsDisposed)
        {
            return;
        }

        _contentDebounceDelayer?.Dispose();
        _textDebounceDelayer?.Dispose();
        _selectionDebounceDelayer?.Dispose();
        await base.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    [JSInvokable]
    public override async Task OnContentChangedAsync(TextChangeEvent args)
    {
        InternalContent = await GetContentAsync();
        InternalText = await GetTextAsync();
        _contentDebounceDelayer?.ResetDelay();
        _textDebounceDelayer?.ResetDelay();
    }

    [JSInvokable]
    public override Task OnSelectionChangedAsync(SelectionChangeEvent args)
    {
        InternalSelection = args.NewRange;
        _selectionDebounceDelayer?.ResetDelay();
        return Task.CompletedTask;
    }

    protected override void OnInitialized()
    {
        base.OnInitialized();

        _contentDebounceDelayer = new Delayer(DebounceMilliseconds);
        _contentDebounceDelayer.DelayElapsed += async (_, _) => await InvokeAsync(UpdateContentAsync);
        _textDebounceDelayer = new Delayer(DebounceMilliseconds);
        _textDebounceDelayer.DelayElapsed += async (_, _) => await InvokeAsync(UpdateTextAsync);
        _selectionDebounceDelayer = new Delayer(DebounceMilliseconds);
        _selectionDebounceDelayer.DelayElapsed += async (_, _) => await InvokeAsync(UpdateSelectionAsync);
    }

    protected override async Task InitializeEditorAsync()
    {
        await RichTextEditorJs.CreateEditorAsync(
            JsRuntime,
            DotNetObjectReference,
            QuillReference,
            ToolbarReference,
            IsEditorEnabled,
            shouldRegisterCallbacks: true,
            placeholder: Placeholder,
            theme: Theme.ToString().ToLower(),
            debugLevel: DebugLevel.ToString().ToLower(),
            fonts: ToolbarOptions.Fonts);

        IsInitialized = true;
        await SetContentAsync(Content);
    }
}
