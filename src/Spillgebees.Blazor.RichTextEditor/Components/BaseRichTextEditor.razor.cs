using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public abstract partial class BaseRichTextEditor : ComponentBase, IAsyncDisposable
{
    [Inject]
    protected IJSRuntime JsRuntime { get; set; } = default!;

    /// <summary>
    /// <para>
    /// Contains the HTML representation of the editor content. This is the primary way to interact with the editor.
    /// </para>
    /// </summary>
    [Parameter]
    public string Content { get; set; } = string.Empty;

    [Parameter]

    public EventCallback<string> ContentChanged { get; set; }

    /// <summary>
    /// <para>
    /// Contains the textual representation of the editor content. <b>Read only</b>.
    /// </para>
    /// </summary>
    [Parameter]
    public string? Text
    {
        get => InternalText;
        // ReSharper disable once ValueParameterNotUsed
        set
        {
        }
    }

    [Parameter]
    public EventCallback<string> TextChanged { get; set; }

    [Parameter]
    public Range? Selection { get; set; }

    [Parameter]
    public EventCallback<Range?> SelectionChanged { get; set; }

    /// <summary>
    /// <para>
    /// Uses <see cref="Spillgebees.Blazor.RichTextEditor.Components.Toolbar.ToolbarOptions.BasicToolbarOptions"/> by default.
    /// You can also supply <see cref="ToolbarOptions.FullToolbarOptions"/> to enable all features, or create your own <see cref="ToolbarOptions"/>.
    /// </para>
    /// <para>
    /// If you want to completely customise the toolbar, use <see cref="ToolbarContent"/>.
    /// All <see cref="ToolbarOptions"/> still apply as long as you use the controls defined
    /// in the <b>Toolbar.Controls</b> namespace.
    /// </para>
    /// <para>
    /// Note: Fonts <b>must</b> be defined in <see cref="ToolbarOptions"/>, otherwise they will not be available in the toolbar.
    /// </para>
    /// </summary>
    [Parameter]
    public ToolbarOptions ToolbarOptions { get; set; } = ToolbarOptions.BasicToolbarOptions;

    [Parameter]
    public RenderFragment? EditorContent { get; set; }

    [Parameter]
    public string EditorContainerHtmlId { get; set; } = $"rich-text-editor-editor-container-{Guid.NewGuid()}";

    /// <summary>
    /// <para>
    /// Use this is you want to completely customise the toolbar. See <see cref="ToolbarOptions"/> for more information.
    /// </para>
    /// </summary>
    [Parameter]
    public RenderFragment? ToolbarContent { get; set; }

    [Parameter]
    public bool IsEditorEnabled { get; set; } = true;

    [Parameter]
    public string Placeholder { get; set; } = "Compose an epic...";

    [Parameter]
    public QuillTheme Theme { get; set; } = QuillTheme.Snow;

    [Parameter]
    public string ContainerClass { get; set; } = string.Empty;

    [Parameter]
    public QuillDebugLevel DebugLevel { get; set; } = QuillDebugLevel.Error;

    protected string? InternalContent;
    protected string? InternalText;
    protected Range? InternalSelection;

    protected string InternalContainerClass => $"rich-text-editor-container {ContainerClass}";
    protected ElementReference QuillReference;
    protected ElementReference ToolbarReference;
    protected DotNetObjectReference<BaseRichTextEditor>? DotNetObjectReference;
    protected bool IsInitialized;
    protected bool IsDisposed;

    public virtual async ValueTask DisposeAsync()
    {
        if (IsDisposed)
        {
            return;
        }

        await RichTextEditorJs.DisposeEditorAsync(JsRuntime, QuillReference);
        DotNetObjectReference?.Dispose();
        IsDisposed = true;
        GC.SuppressFinalize(this);
    }

    [JSInvokable]
    public virtual async Task OnContentChangedAsync(TextChangeEvent args)
    {
        InternalContent = await GetContentAsync();
        InternalText = await GetTextAsync();
    }

    [JSInvokable]
    public virtual Task OnSelectionChangedAsync(SelectionChangeEvent args)
    {
        InternalSelection = args.NewRange;
        return Task.CompletedTask;
    }

    public async Task<string> GetContentAsync()
        => await RichTextEditorJs.GetContentAsync(JsRuntime, QuillReference);

    public async Task<Range?> GetSelectionAsync()
        => await RichTextEditorJs.GetSelectionAsync(JsRuntime, QuillReference);

    public async Task<string> GetTextAsync()
        => await RichTextEditorJs.GetTextAsync(JsRuntime, QuillReference);

    public async Task UpdateContentAsync()
    {
        InternalContent = await GetContentAsync();
        await ContentChanged.InvokeAsync(InternalContent);
    }

    public async Task UpdateTextAsync()
    {
        InternalText = await GetTextAsync();
        await TextChanged.InvokeAsync(InternalText);
    }

    public async Task UpdateSelectionAsync()
    {
        InternalSelection = await GetSelectionAsync();
        await SelectionChanged.InvokeAsync(InternalSelection);
    }

    protected override void OnInitialized()
       => DotNetObjectReference = Microsoft.JSInterop.DotNetObjectReference.Create(this);

    protected override async Task OnParametersSetAsync()
    {
        if (!IsInitialized)
        {
            return;
        }

        if (Content != InternalContent)
        {
            InternalContent = Content;
            await SetContentAsync(InternalContent);
        }

        if (Selection is not null
            && Selection.Equals(InternalSelection)
            || InternalSelection is null)
        {
            InternalSelection = Selection;
            await SetSelectionAsync(Selection);
        }
    }

    protected override Task OnAfterRenderAsync(bool firstRender)
        => !firstRender ? Task.CompletedTask : InitializeEditorAsync();

    protected virtual async Task InitializeEditorAsync()
    {
        await RichTextEditorJs.CreateEditorAsync(
            JsRuntime,

            DotNetObjectReference,
            QuillReference,
            ToolbarReference,
            IsEditorEnabled,
            shouldRegisterCallbacks: false,
            placeholder: Placeholder,
            theme: Theme.ToString().ToLower(),
            debugLevel: DebugLevel.ToString().ToLower(),
            fonts: ToolbarOptions.Fonts);

        IsInitialized = true;
        InternalContent = Content;
        await SetContentAsync(Content);
    }

    protected async Task SetContentAsync(string content)
        => await RichTextEditorJs.SetContentAsync(JsRuntime, QuillReference, content);

    protected async Task SetSelectionAsync(Range? range)
        => await RichTextEditorJs.SetSelectionAsync(JsRuntime, QuillReference, range);

    protected async Task InsertImageAsync(string imageSource)
        => await RichTextEditorJs.InsertImageAsync(JsRuntime, QuillReference, imageSource);

    protected async Task SetEnableEditorStateAsync(bool isEditorEnabled)
        => await RichTextEditorJs.SetIsEditorEnabledAsync(JsRuntime, QuillReference, isEditorEnabled);
}
