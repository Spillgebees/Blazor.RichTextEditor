using Microsoft.Extensions.Logging;

namespace Spillgebees.Blazor.RichTextEditor;

public static class TaskExtensions
{
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
