using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Spillgebees.Blazor.RichTextEditor.Components;

public partial class RichTextEditor : BaseRichTextEditor
{
    protected override async Task OnContentChangedAction(TextChangeEvent args)
    {
        await UpdateContentAsync();
        await UpdateTextAsync();
        await base.OnContentChangedAction(args);
    }

    protected override async Task OnSelectionChangedAction(SelectionChangeEvent args)
    {
        await base.OnSelectionChangedAction(args);
        await UpdateSelectionAsync();
    }
}
