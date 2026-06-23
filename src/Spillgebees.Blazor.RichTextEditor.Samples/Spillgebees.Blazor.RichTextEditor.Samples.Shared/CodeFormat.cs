namespace Spillgebees.Blazor.RichTextEditor.Samples.Shared;

public enum CodeFormat
{
    Html,
    Razor,
}

public static class CodeFormatExtensions
{
    public static string ToLanguageClass(this CodeFormat codeFormat) =>
        codeFormat switch
        {
            CodeFormat.Html => "lang-html",
            CodeFormat.Razor => "lang-cshtml-razor",
            _ => throw new ArgumentOutOfRangeException(nameof(codeFormat), codeFormat, null),
        };
}
