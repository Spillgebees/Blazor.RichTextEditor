using BlazorComponentUtilities;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;
using Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

namespace Spillgebees.Blazor.RichTextEditor.Components;

/// <summary>
/// Shared parameters and methods of <see cref="RichTextEditor"/> and <see cref="PassiveRichTextEditor"/>.
/// </summary>
public abstract partial class BaseRichTextEditor : ComponentBase, IAsyncDisposable
{
    [Inject]
    protected IJSRuntime JsRuntime { get; set; } = null!;

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

    /// <summary>
    /// Raised with the new HTML when the content changes.
    /// Only <see cref="RichTextEditor"/> raises it on its own, once editing pauses for <see cref="DebounceIntervalInMilliseconds"/>, so intermediate values are skipped.
    /// </summary>
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
        set { }
    }

    /// <summary>
    /// Raised with the new plain text when the content changes.
    /// Only <see cref="RichTextEditor"/> raises it on its own, once editing pauses for <see cref="DebounceIntervalInMilliseconds"/>, so intermediate values are skipped.
    /// </summary>
    [Parameter]
    public EventCallback<string> TextChanged { get; set; }

    /// <summary>
    /// The current selection, or <c>null</c> when the editor has no focus. Changing it after the editor initializes
    /// moves the selection in the editor; the initial value is not applied.
    /// </summary>
    [Parameter]
    public Range? Selection { get; set; }

    /// <summary>
    /// Raised when the selection changes.
    /// Only <see cref="RichTextEditor"/> raises it on its own, once editing pauses for <see cref="DebounceIntervalInMilliseconds"/>, so intermediate values are skipped.
    /// </summary>
    [Parameter]
    public EventCallback<Range?> SelectionChanged { get; set; }

    /// <summary>
    /// Whether the content can be edited. Defaults to <c>true</c>. See <see cref="Spillgebees.Blazor.RichTextEditor.Components.Toolbar.ToolbarOptions.ToolbarDisabledBehavior"/> for what happens to the toolbar.
    /// </summary>
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
    /// This replaces default Quill keybindings for better accessibility, notably making the <c>Tab</c> character tab out of the component.
    /// </para>
    /// </summary>
    /// <remarks>
    /// Can only be set once. Defaults to <c>false</c> for backwards compatibility purposes but may be switched to <c>true</c> in future versions.
    /// </remarks>
    [Parameter]
    public bool UseAccessibleKeybindings { get; set; }

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

    /// <summary>
    /// Markup rendered inside the editor container. It is only visible until the editor initializes, after which <see cref="Content"/> replaces it.
    /// </summary>
    [Parameter]
    public RenderFragment? EditorContent { get; set; }

    /// <summary>
    /// The <c>id</c> of the editor container. Defaults to a unique generated id; set it when you need a stable one.
    /// </summary>
    [Parameter]
    public string EditorContainerHtmlId { get; set; } = $"rich-text-editor-editor-container-{Guid.NewGuid()}";

    /// <summary>
    /// <para>
    /// Use this is you want to completely customise the toolbar. See <see cref="ToolbarOptions"/> for more information.
    /// </para>
    /// </summary>
    [Parameter]
    public RenderFragment? ToolbarContent { get; set; }

    /// <summary>
    /// Text shown while the editor is empty. Can only be set once.
    /// </summary>
    [Parameter]
    public string Placeholder { get; set; } = "Compose an epic...";

    /// <summary>
    /// The Quill theme. Can only be set once. Defaults to <see cref="QuillTheme.Snow"/>.
    /// </summary>
    [Parameter]
    public QuillTheme Theme { get; set; } = QuillTheme.Snow;

    /// <summary>
    /// Extra CSS classes for the element that wraps the toolbar and the editor.
    /// </summary>
    [Parameter]
    public string ContainerClass { get; set; } = string.Empty;

    /// <summary>
    /// CSS class added to the wrapping element while <see cref="IsEditorEnabled"/> is <c>false</c>.
    /// </summary>
    [Parameter]
    public string ContainerDisabledClass { get; set; } = "rich-text-editor-container-disabled";

    /// <summary>
    /// Extra CSS classes for the editor container.
    /// </summary>
    [Parameter]
    public string EditorContainerClass { get; set; } = string.Empty;

    /// <summary>
    /// CSS class added to the editor container while <see cref="IsEditorEnabled"/> is <c>false</c>.
    /// </summary>
    [Parameter]
    public string EditorContainerDisabledClass { get; set; } = "rich-text-editor-editor-container-disabled";

    /// <summary>
    /// The level at which Quill logs to the browser console. Can only be set once. Defaults to <see cref="QuillDebugLevel.Error"/>.
    /// </summary>
    [Parameter]
    public QuillDebugLevel DebugLevel { get; set; } = QuillDebugLevel.Error;

    protected string? InternalContent;
    protected string? InternalText;
    protected Range? InternalSelection;
    protected bool InternalIsEditorEnabled;

    protected string InternalContainerClass =>
        new CssBuilder()
            .AddClass("rich-text-editor-container")
            .AddClass(ContainerClass)
            .AddClass(ContainerDisabledClass, IsEditorEnabled is false)
            .Build();

    protected string InternalEditorContainerClass =>
        new CssBuilder()
            .AddClass("ql-container")
            .AddClass("ql-snow", Theme is QuillTheme.Snow)
            .AddClass("ql-bubble", Theme is QuillTheme.Bubble)
            .AddClass("ql-disabled", IsEditorEnabled is false)
            .AddClass("rich-text-editor-editor-container")
            .AddClass(EditorContainerClass)
            .AddClass(EditorContainerDisabledClass, IsEditorEnabled is false)
            .Build();

    protected string InternalToolbarContainerClass =>
        new CssBuilder()
            .AddClass("ql-toolbar")
            .AddClass("ql-snow", Theme is QuillTheme.Snow)
            .AddClass("ql-bubble", Theme is QuillTheme.Bubble)
            .AddClass("ql-disabled", IsEditorEnabled is false)
            .AddClass("rich-text-editor-toolbar-container")
            .AddClass("rich-text-editor-toolbar-container-top", ToolbarOptions.ToolbarPosition is ToolbarPosition.Top)
            .AddClass(
                "rich-text-editor-toolbar-container-bottom",
                ToolbarOptions.ToolbarPosition is ToolbarPosition.Bottom
            )
            .AddClass(ToolbarOptions.ToolbarContainerClass)
            .AddClass(
                ToolbarOptions.ToolbarContainerDisabledClass,
                IsEditorEnabled is false && ToolbarOptions.ToolbarDisabledBehavior is ToolbarDisabledBehavior.Disabled
            )
            .AddClass(
                ToolbarOptions.ToolbarContainerHiddenClass,
                IsEditorEnabled is false && ToolbarOptions.ToolbarDisabledBehavior is ToolbarDisabledBehavior.Hidden
                    || ToolbarOptions.HideToolbar
            )
            .Build();

    protected ElementReference QuillReference;
    protected ElementReference ToolbarReference;
    protected DotNetObjectReference<BaseRichTextEditor>? DotNetObjectReference;
    protected bool IsInitialized;
    protected bool IsDisposing;

    public virtual async ValueTask DisposeAsync()
    {
        if (IsDisposing)
        {
            return;
        }
        IsDisposing = true;

        try
        {
            await RichTextEditorJs.DisposeEditorAsync(JsRuntime, Logger.Value, QuillReference);
        }
        catch (Exception exception) when (exception is JSDisconnectedException or OperationCanceledException) { }
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

    /// <summary>
    /// Reads the current HTML from the editor without updating <see cref="Content"/>. Returns an empty string before the editor initializes.
    /// </summary>
    public async Task<string> GetContentAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return string.Empty;
        }

        return await RichTextEditorJs.GetContentAsync(JsRuntime, Logger.Value, QuillReference);
    }

    /// <summary>
    /// Reads the current selection from the editor without updating <see cref="Selection"/>. Returns <c>null</c> before the editor initializes.
    /// </summary>
    public async Task<Range?> GetSelectionAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return null;
        }

        return await RichTextEditorJs.GetSelectionAsync(JsRuntime, Logger.Value, QuillReference);
    }

    /// <summary>
    /// Reads the current plain text from the editor without updating <see cref="Text"/>. Returns an empty string before the editor initializes.
    /// </summary>
    public async Task<string> GetTextAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return string.Empty;
        }

        return await RichTextEditorJs.GetTextAsync(JsRuntime, Logger.Value, QuillReference);
    }

    /// <summary>
    /// Reads the current HTML from the editor and raises <see cref="ContentChanged"/> with it.
    /// </summary>
    public async Task UpdateContentAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalContent = await GetContentAsync();
        ContentChanged.InvokeAsync(InternalContent).AndForget(Logger.Value);
    }

    /// <summary>
    /// Reads the current plain text from the editor and raises <see cref="TextChanged"/> with it.
    /// </summary>
    public async Task UpdateTextAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalText = await GetTextAsync();
        TextChanged.InvokeAsync(InternalText).AndForget(Logger.Value);
    }

    /// <summary>
    /// Reads the current selection from the editor and raises <see cref="SelectionChanged"/> with it.
    /// </summary>
    public async Task UpdateSelectionAsync()
    {
        if (IsInitialized is false || IsDisposing)
        {
            return;
        }

        InternalSelection = await GetSelectionAsync();
        SelectionChanged.InvokeAsync(InternalSelection).AndForget(Logger.Value);
    }

    /// <summary>
    /// Called from JavaScript once Quill is ready. Not meant to be called from your code.
    /// </summary>
    [JSInvokable]
    public void OnEditorInitialized()
    {
        if (IsInitialized)
        {
            return;
        }

        IsInitialized = true;
    }

    /// <summary>
    /// Called from JavaScript when the content changes. Not meant to be called from your code.
    /// </summary>
    [JSInvokable]
    public Task OnContentChangedAsync(TextChangeEvent args) => OnContentChangedAction(args);

    /// <summary>
    /// Called from JavaScript when the selection changes. Not meant to be called from your code.
    /// </summary>
    [JSInvokable]
    public Task OnSelectionChangedAsync(SelectionChangeEvent args) => OnSelectionChangedAction(args);

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

        if (
            Selection is not null
            && (Selection.Length != InternalSelection?.Length || Selection.Index != InternalSelection?.Index)
        )
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

    protected override Task OnAfterRenderAsync(bool firstRender) =>
        firstRender ? InitializeEditorAsync() : Task.CompletedTask;

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
            DebounceIntervalInMilliseconds,
            UseAccessibleKeybindings
        );

        InternalContent = Content;
        await SetContentAsync(Content);
    }

    protected async Task SetContentAsync(string content) =>
        await RichTextEditorJs.SetContentAsync(JsRuntime, Logger.Value, QuillReference, content);

    protected async Task SetSelectionAsync(Range? range) =>
        await RichTextEditorJs.SetSelectionAsync(JsRuntime, Logger.Value, QuillReference, range);

    protected async Task SetIsEditorEnabledAsync(bool isEditorEnabled) =>
        await RichTextEditorJs.SetIsEditorEnabledAsync(JsRuntime, Logger.Value, QuillReference, isEditorEnabled);

    protected async Task InsertImageAsync(string imageSource) =>
        await RichTextEditorJs.InsertImageAsync(JsRuntime, Logger.Value, QuillReference, imageSource);

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

    protected virtual Task OnSelectionChangedAction(SelectionChangeEvent args) => Task.CompletedTask;
}
