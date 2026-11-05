namespace Spillgebees.Blazor.RichTextEditor.Components.Toolbar;

/// <summary>
/// What happens to the toolbar while the editor is disabled.
/// </summary>
public enum ToolbarDisabledBehavior
{
    /// <summary>
    /// The toolbar stays visible but cannot be used.
    /// </summary>
    Disabled,

    /// <summary>
    /// The toolbar is hidden.
    /// </summary>
    Hidden,
}
