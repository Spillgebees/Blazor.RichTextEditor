using System.Text.Json.Serialization;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public interface IQuillEvent
{
    EventSource Source { get; init; }
};

public record TextChangeEvent(EventSource Source) : IQuillEvent;

public record SelectionChangeEvent(Range? OldRange, Range? NewRange, EventSource Source) : IQuillEvent;

public record Delta(
    IReadOnlyList<DeltaOperation> Ops,
    IReadOnlyDictionary<string, object> Attributes);

public record DeltaOperation(object? Insert, object? Retain, object? Delete);

public record Range(int Index, int Length);

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DeltaOperationType
{
    Insert,
    Delete,
    Retain
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EventSource
{
    Api,
    User,
    Silent,
    Unknown
}

