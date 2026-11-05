namespace Spillgebees.Blazor.RichTextEditor.Components;

/// <summary>
/// A Quill editor that only sends its content, text and selection to Blazor when you call
/// <see cref="BaseRichTextEditor.UpdateContentAsync"/>, <see cref="BaseRichTextEditor.UpdateTextAsync"/> or
/// <see cref="BaseRichTextEditor.UpdateSelectionAsync"/>. Use it for large documents, where sending every change
/// over JS interop is slow.
/// </summary>
public partial class PassiveRichTextEditor;
