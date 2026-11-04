namespace Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

/// <summary>
/// Which controls the built-in toolbar shows, and how the toolbar is placed and styled. Start from
/// <see cref="BasicToolbarOptions"/>, <see cref="FullToolbarOptions"/> or <see cref="None"/> and change it with a
/// <c>with</c> expression. <see cref="None"/> sets <see cref="HideToolbar"/>, so to add controls to it, also
/// set <c>HideToolbar = false</c>, or start from <c>new ToolbarOptions()</c> instead.
/// </summary>
/// <param name="ShowFontControls">Shows the font picker, filled from <see cref="Fonts"/>.</param>
/// <param name="ShowSizeControls">Shows the small, normal, large and huge size picker.</param>
/// <param name="ShowStyleControls">Shows the bold, italic, underline and strikethrough buttons.</param>
/// <param name="ShowColorControls">Shows the text and background color pickers.</param>
/// <param name="ShowHeaderControls">Shows the heading 1 and heading 2 buttons.</param>
/// <param name="ShowQuotationControls">Shows the block quote button.</param>
/// <param name="ShowCodeBlockControls">Shows the code block button.</param>
/// <param name="ShowListControls">Shows the numbered and bulleted list buttons.</param>
/// <param name="ShowIndentationControls">Shows the outdent and indent buttons.</param>
/// <param name="ShowAlignmentControls">Shows the alignment picker.</param>
/// <param name="ShowDirectionControls">Shows the right-to-left button.</param>
/// <param name="ShowHypertextLinkControls">Shows the link button.</param>
/// <param name="ShowInsertImageControls">Shows the image button.</param>
/// <param name="ShowEmbedVideoControls">Shows the video button.</param>
/// <param name="ShowMathControls">Shows the formula, subscript and superscript buttons. The formula button needs KaTeX loaded on the page.</param>
/// <param name="ShowCleanFormattingControls">Shows the button that removes formatting from the selection.</param>
/// <param name="ToolbarContainerHtmlId">The <c>id</c> of the toolbar container. Defaults to a unique generated id.</param>
/// <param name="Fonts">The fonts offered by the font picker. Defaults to Quill's sans serif, serif and monospace.</param>
/// <param name="ToolbarPosition">Whether the toolbar sits above or below the editor.</param>
/// <param name="ToolbarContainerClass">Extra CSS classes for the toolbar container.</param>
/// <param name="ToolbarDisabledBehavior">What happens to the toolbar while the editor is disabled.</param>
/// <param name="ToolbarContainerDisabledClass">CSS class added to the toolbar while it is disabled.</param>
/// <param name="ToolbarContainerHiddenClass">CSS class added to the toolbar while it is hidden.</param>
/// <param name="HideToolbar">Hides the toolbar whatever the other options say.</param>
public record ToolbarOptions(
    bool ShowFontControls = false,
    bool ShowSizeControls = false,
    bool ShowStyleControls = false,
    bool ShowColorControls = false,
    bool ShowHeaderControls = false,
    bool ShowQuotationControls = false,
    bool ShowCodeBlockControls = false,
    bool ShowListControls = false,
    bool ShowIndentationControls = false,
    bool ShowAlignmentControls = false,
    bool ShowDirectionControls = false,
    bool ShowHypertextLinkControls = false,
    bool ShowInsertImageControls = false,
    bool ShowEmbedVideoControls = false,
    bool ShowMathControls = false,
    bool ShowCleanFormattingControls = false,
    string? ToolbarContainerHtmlId = null,
    List<string>? Fonts = null,
    ToolbarPosition ToolbarPosition = ToolbarPosition.Top,
    string ToolbarContainerClass = "",
    ToolbarDisabledBehavior ToolbarDisabledBehavior = ToolbarDisabledBehavior.Disabled,
    string ToolbarContainerDisabledClass = "rich-text-editor-toolbar-container-disabled",
    string ToolbarContainerHiddenClass = "rich-text-editor-toolbar-container-hidden",
    bool HideToolbar = false
)
{
    private static readonly List<string> _defaultFonts = ["", "serif", "monospace"];

    /// <summary>
    /// The <c>id</c> of the toolbar container. Defaults to a unique generated id.
    /// </summary>
    public string ToolbarContainerHtmlId { get; init; } =
        ToolbarContainerHtmlId ?? $"rich-text-editor-toolbar-container-{Guid.NewGuid()}";

    /// <summary>
    /// The fonts offered by the font picker. The first one is selected by default, and an empty string is Quill's
    /// sans serif default. Every other font needs a matching <c>ql-font-&lt;name&gt;</c> class in your stylesheet.
    /// Can only be set once.
    /// </summary>
    public List<string> Fonts { get; init; } = Fonts ?? _defaultFonts;

    /// <summary>
    /// Font, inline style, list and link controls. The default.
    /// </summary>
    public static ToolbarOptions BasicToolbarOptions =>
        new()
        {
            ShowFontControls = true,
            ShowStyleControls = true,
            ShowListControls = true,
            ShowHypertextLinkControls = true,
        };

    /// <summary>
    /// Every built-in control.
    /// </summary>
    public static ToolbarOptions FullToolbarOptions =>
        new()
        {
            ShowFontControls = true,
            ShowSizeControls = true,
            ShowStyleControls = true,
            ShowColorControls = true,
            ShowHeaderControls = true,
            ShowQuotationControls = true,
            ShowCodeBlockControls = true,
            ShowListControls = true,
            ShowIndentationControls = true,
            ShowAlignmentControls = true,
            ShowDirectionControls = true,
            ShowHypertextLinkControls = true,
            ShowInsertImageControls = true,
            ShowEmbedVideoControls = true,
            ShowMathControls = true,
            ShowCleanFormattingControls = true,
        };

    /// <summary>
    /// No toolbar. Sets <see cref="HideToolbar"/>.
    /// </summary>
    public static ToolbarOptions None =>
        new()
        {
            ShowFontControls = false,
            ShowSizeControls = false,
            ShowStyleControls = false,
            ShowColorControls = false,
            ShowHeaderControls = false,
            ShowQuotationControls = false,
            ShowCodeBlockControls = false,
            ShowListControls = false,
            ShowIndentationControls = false,
            ShowAlignmentControls = false,
            ShowDirectionControls = false,
            ShowHypertextLinkControls = false,
            ShowInsertImageControls = false,
            ShowEmbedVideoControls = false,
            ShowMathControls = false,
            ShowCleanFormattingControls = false,
            HideToolbar = true,
        };
}
