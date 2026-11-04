using System.Text.Json.Serialization;

namespace Spillgebees.Blazor.RichTextEditor.Components;

/// <summary>
/// An event raised by Quill.
/// </summary>
public interface IQuillEvent
{
    /// <summary>
    /// What caused the event.
    /// </summary>
    EventSource Source { get; init; }
};

/// <summary>
/// Raised by Quill when the content changes.
/// </summary>
/// <param name="Source">What caused the change.</param>
public record TextChangeEvent(EventSource Source) : IQuillEvent;

/// <summary>
/// Raised by Quill when the selection changes.
/// </summary>
/// <param name="OldRange">The previous selection, or <c>null</c> if the editor had no focus.</param>
/// <param name="NewRange">The new selection, or <c>null</c> if the editor lost focus.</param>
/// <param name="Source">What caused the change.</param>
public record SelectionChangeEvent(Range? OldRange, Range? NewRange, EventSource Source) : IQuillEvent;

public record Delta(IReadOnlyList<DeltaOperation> Ops, IReadOnlyDictionary<string, object> Attributes);

public record DeltaOperation(object? Insert, object? Retain, object? Delete);

/// <summary>
/// A selection in the editor, counted in characters of its plain text.
/// </summary>
/// <param name="Index">Where the selection starts.</param>
/// <param name="Length">How many characters are selected. <c>0</c> for a caret.</param>
public record Range(int Index, int Length);

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DeltaOperationType
{
    Insert,
    Delete,
    Retain,
}

/// <summary>
/// What caused a Quill event.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EventSource
{
    /// <summary>
    /// A call to Quill's API, including the editor setting <see cref="BaseRichTextEditor.Content"/>.
    /// </summary>
    Api,

    /// <summary>
    /// The user, by typing, formatting or selecting.
    /// </summary>
    User,
    Silent,
    Unknown,
}
