using BlazorComponentUtilities;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;
using Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public abstract partial class BaseRichTextEditor : ComponentBase, IAsyncDisposable
{
    [Inject]
    protected IJSRuntime JsRuntime { get; set; } = default!;

    [Inject]
    private ILoggerFactory _loggerFactory { get; set; } = null!;
    protected Lazy<ILogger> Logger => new(() => _loggerFactory.CreateLogger(GetType()));

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

    [Parameter]
    public bool IsEditorEnabled { get; set; } = true;

    [Parameter]
    public EventCallback<bool> IsEditorEnabledChanged { get; set; }

    /// <summary>
    /// <para>
    /// Indicates whether the component has been touched, more specifically if the editor content has changed.
    /// </para>
    /// </summary>
    [Parameter]
    public bool IsTouched { get; set; }

    [Parameter]
    public EventCallback<bool> IsTouchedChanged { get; set; }

    /// <summary>
    /// <para>
    /// Applies to <see cref="ContentChanged"/>, <see cref="TextChanged"/>, and <see cref="SelectionChanged"/>.
    /// </para>
    /// <para>
    /// Can only be set once. Defaults to <b>500</b> milliseconds.
    /// </para>
    /// <para>
    /// This throttles events on the JavaScript side to keep interop calls to a minimum.
    /// </para>
    /// </summary>
    [Parameter]
    public int DebounceIntervalInMilliseconds { get; set; } = 500;

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
    public string Placeholder { get; set; } = "Compose an epic...";

    [Parameter]
    public QuillTheme Theme { get; set; } = QuillTheme.Snow;

    [Parameter]
    public string ContainerClass { get; set; } = string.Empty;

    [Parameter]
    public string ContainerDisabledClass { get; set; } = "rich-text-editor-container-disabled";

    [Parameter]
    public string EditorContainerClass { get; set; } = string.Empty;

    [Parameter]
    public string EditorContainerDisabledClass { get; set; } = "rich-text-editor-editor-container-disabled";


    [Parameter]
    public QuillDebugLevel DebugLevel { get; set; } = QuillDebugLevel.Error;

    protected string? InternalContent;
    protected string? InternalText;
    protected Range? InternalSelection;
    protected bool InternalIsEditorEnabled;

    protected string InternalContainerClass => new CssBuilder()
        .AddClass("rich-text-editor-container")
        .AddClass(ContainerClass)
        .AddClass(ContainerDisabledClass, IsEditorEnabled is false)
        .Build();

    protected string InternalEditorContainerClass => new CssBuilder()
        .AddClass("ql-container")
        .AddClass("ql-snow", Theme is QuillTheme.Snow)
        .AddClass("ql-bubble", Theme is QuillTheme.Bubble)
        .AddClass("ql-disabled", IsEditorEnabled is false)
        .AddClass("rich-text-editor-editor-container")
        .AddClass(EditorContainerClass, IsEditorEnabled is false)
        .AddClass(EditorContainerDisabledClass, IsEditorEnabled is false)
        .Build();

    protected string InternalToolbarContainerClass => new CssBuilder()
        .AddClass("ql-toolbar")
        .AddClass("ql-snow", Theme is QuillTheme.Snow)
        .AddClass("ql-bubble", Theme is QuillTheme.Bubble)
        .AddClass("ql-disabled", IsEditorEnabled is false)
        .AddClass("rich-text-editor-toolbar-container")
        .AddClass("rich-text-editor-toolbar-container-top", ToolbarOptions.ToolbarPosition is ToolbarPosition.Top)
        .AddClass("rich-text-editor-toolbar-container-bottom", ToolbarOptions.ToolbarPosition is ToolbarPosition.Bottom)
        .AddClass(ToolbarOptions.ToolbarContainerClass)
        .AddClass(ToolbarOptions.ToolbarContainerDisabledClass, IsEditorEnabled is false && ToolbarOptions.ToolbarDisabledBehavior is ToolbarDisabledBehavior.Disabled)
        .AddClass(ToolbarOptions.ToolbarContainerHiddenClass, IsEditorEnabled is false && ToolbarOptions.ToolbarDisabledBehavior is ToolbarDisabledBehavior.Hidden)
        .Build();

    protected ElementReference QuillReference;
    protected ElementReference ToolbarReference;
    protected DotNetObjectReference<BaseRichTextEditor>? DotNetObjectReference;
    protected bool IsInitialized;
    protected bool IsDisposing;

    private TaskCompletionSource _initializationCompletionSource = new();

    public virtual async ValueTask DisposeAsync()
    {
        if (IsDisposing)
        {
            return;
        }
        IsDisposing = true;

        try
        {
            // ensure initialization has been completed to avoid DotNetObjectReference disposed exceptions
            await _initializationCompletionSource.Task;
            await RichTextEditorJs.DisposeEditorAsync(JsRuntime, Logger.Value, QuillReference);
        }
        catch (Exception exception) when (exception is JSDisconnectedException or OperationCanceledException)
        {
        }
        catch (Exception exception)
        {
            Logger.Value.LogError(exception, "Failed to dispose editor");
        }
        finally
        {
            DotNetObjectReference?.Dispose();
        }

        GC.SuppressFinalize(this);
    }

    public async Task<string> GetContentAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return string.Empty;
        }

        return await RichTextEditorJs.GetContentAsync(JsRuntime, Logger.Value, QuillReference);
    }

    public async Task<Range?> GetSelectionAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return null;
        }

        return await RichTextEditorJs.GetSelectionAsync(JsRuntime, Logger.Value, QuillReference);
    }

    public async Task<string> GetTextAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return string.Empty;
        }

        return await RichTextEditorJs.GetTextAsync(JsRuntime, Logger.Value, QuillReference);
    }

    public async Task UpdateContentAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalContent = await GetContentAsync();
        ContentChanged.InvokeAsync(InternalContent).AndForget(Logger.Value);
    }

    public async Task UpdateTextAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalText = await GetTextAsync();
        TextChanged.InvokeAsync(InternalText).AndForget(Logger.Value);
    }

    public async Task UpdateSelectionAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalSelection = await GetSelectionAsync();
        SelectionChanged.InvokeAsync(InternalSelection).AndForget(Logger.Value);
    }

    [JSInvokable]
    public void OnEditorInitialized()
    {
        if (IsInitialized)
        {
            return;
        }

        _initializationCompletionSource.TrySetResult();
        IsInitialized = true;
    }

    [JSInvokable]
    public Task OnContentChangedAsync(TextChangeEvent args)
        => OnContentChangedAction(args);

    [JSInvokable]
    public  Task OnSelectionChangedAsync(SelectionChangeEvent args)
        => OnSelectionChangedAction(args);

    protected override async Task OnParametersSetAsync()
    {
        if (IsInitialized is false)
        {
            return;
        }

        if (Content != InternalContent)
        {
            InternalContent = Content;
            await SetContentAsync(InternalContent);
        }

        if (Selection is not null
            && Selection.Length != InternalSelection?.Length
            && Selection.Index != InternalSelection?.Index)
        {
            InternalSelection = Selection;
            await SetSelectionAsync(InternalSelection);
        }

        if (IsEditorEnabled != InternalIsEditorEnabled)
        {
            InternalIsEditorEnabled = IsEditorEnabled;
            await SetIsEditorEnabledAsync(InternalIsEditorEnabled);
        }
    }

    protected override Task OnAfterRenderAsync(bool firstRender)
        => firstRender
            ? InitializeEditorAsync()
            : Task.CompletedTask;

    protected virtual async Task InitializeEditorAsync()
    {
        DotNetObjectReference = Microsoft.JSInterop.DotNetObjectReference.Create(this);

        await RichTextEditorJs.CreateEditorAsync(
            JsRuntime,
            Logger.Value,
            DotNetObjectReference,
            nameof(OnEditorInitialized),
            QuillReference,
            ToolbarReference,
            IsEditorEnabled,
            shouldRegisterCallbacks: true,
            placeholder: Placeholder,
            theme: Theme.ToString().ToLower(),
            debugLevel: DebugLevel.ToString().ToLower(),
            fonts: ToolbarOptions.Fonts,
            DebounceIntervalInMilliseconds);

        InternalContent = Content;
        await SetContentAsync(Content);
    }

    protected async Task SetContentAsync(string content)
        => await RichTextEditorJs.SetContentAsync(
            JsRuntime,
            Logger.Value,
            QuillReference,
            content);

    protected async Task SetSelectionAsync(Range? range)
        => await RichTextEditorJs.SetSelectionAsync(JsRuntime, Logger.Value, QuillReference, range);

    protected async Task SetIsEditorEnabledAsync(bool isEditorEnabled)
        => await RichTextEditorJs.SetIsEditorEnabledAsync(JsRuntime, Logger.Value, QuillReference, isEditorEnabled);

    protected async Task InsertImageAsync(string imageSource)
        => await RichTextEditorJs.InsertImageAsync(JsRuntime, Logger.Value, QuillReference, imageSource);

    protected virtual Task OnContentChangedAction(TextChangeEvent args)
    {
        if (args.Source is not EventSource.User)
        {
            return Task.CompletedTask;
        }

        IsTouched = true;
        IsTouchedChanged.InvokeAsync(IsTouched).AndForget(Logger.Value);

        return Task.CompletedTask;
    }

    protected virtual Task OnSelectionChangedAction(SelectionChangeEvent args)
        => Task.CompletedTask;
}
