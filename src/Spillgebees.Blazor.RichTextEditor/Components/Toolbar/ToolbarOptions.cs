namespace Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

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

    public string ToolbarContainerHtmlId { get; init; } =
        ToolbarContainerHtmlId ?? $"rich-text-editor-toolbar-container-{Guid.NewGuid()}";
    public List<string> Fonts { get; init; } = Fonts ?? _defaultFonts;

    public static ToolbarOptions BasicToolbarOptions =>
        new()
        {
            ShowFontControls = true,
            ShowStyleControls = true,
            ShowListControls = true,
            ShowHypertextLinkControls = true,
        };

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
