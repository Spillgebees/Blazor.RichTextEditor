using Microsoft.Extensions.Logging;

namespace Spillgebees.Blazor.RichTextEditor;

public static class TaskExtensions
{
    /// <summary>
    /// Runs <paramref name="task"/> without awaiting it and logs any exception instead of throwing it.
    /// </summary>
    public static async void AndForget(this Task task, ILogger logger)
    {
        try
        {
            await task;
        }
        catch (Exception e)
        {
            logger.LogError(e, "An unexpected error occurred");
        }
    }

    /// <summary>
    /// Runs <paramref name="task"/> without awaiting it and logs any exception instead of throwing it.
    /// </summary>
    public static async void AndForget(this ValueTask task, ILogger logger)
    {
        try
        {
            await task;
        }
        catch (Exception e)
        {
            logger.LogError(e, "An unexpected error occurred");
        }
    }
}
