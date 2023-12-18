using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public partial class RichTextEditor : BaseRichTextEditor
{
    [JSInvokable]
    public override async Task OnContentChangedAsync(TextChangeEvent args)
    {
        await base.OnContentChangedAsync(args);
        await UpdateContentAsync();
        await UpdateTextAsync();
    }

    [JSInvokable]
    public override async Task OnSelectionChangedAsync(SelectionChangeEvent args)
    {
        await base.OnSelectionChangedAsync(args);
        InternalSelection = args.NewRange;
        await SelectionChanged.InvokeAsync(InternalSelection);
    }
}
