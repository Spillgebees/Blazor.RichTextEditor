`Spillgebees.Blazor.RichTextEditor` is a [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) Blazor component enabling rich text content editing. It is powered by [Quill](https://github.com/quilljs/quill).

This component is based on a mix of the following repos:

- [chrissainty's `Blazored.TextEditor`](https://github.com/Blazored/TextEditor), the original implementation.
- [vixys' fork of `Blazored.TextEditor`](https://github.com/Vixys/TextEditor), mainly the `OnTextChanged` implementation logic.
- [somegenericdev's `WYSIWYGTextEditor`](https://github.com/somegenericdev/WYSIWYGTextEditor), mainly the more convenient usage/component structure.

### Registering the component

This component comes with a [JS initializer](https://learn.microsoft.com/en-us/aspnet/core/blazor/fundamentals/startup?view=aspnetcore-8.0#javascript-initializers), as such it is bootstrapped when `Blazor` launches.

The only thing you need to do is to add Quill's CSS files for styling.

This package comes with a `.css` file that includes both Quill themes' CSS files for convenience, so you can either add it as an import to your main CSS file:

```css
/* relative to `wwwroot` */
@import "../_content/Spillgebees.Blazor.RichTextEditor/Spillgebees.Blazor.RichTextEditor.lib.module.css";

h1:focus {
    outline: none;
}

...
```

Or include it in the `head` tag directly:

```html
<link href="_content/Spillgebees.Blazor.RichTextEditor/Spillgebees.Blazor.RichTextEditor.lib.module.css"
      rel="stylesheet" />
```

You could also just pass CDN links or your custom CSS using the latter.

### Usage

You can take a look at the demo pages for a few general usage examples: [net7.0](https://spillgebees.github.io/Blazor.RichTextEditor/main/net7.0/), [net8.0](https://spillgebees.github.io/Blazor.RichTextEditor/main/net8.0/)

This package comes with two components: `RichTextEditor` and `PassiveRichTextEditor`

The only difference between these two is that `RichTextEditor` will immediately react to changes (i.e. by updating its `Content`, `IsTouched`, ... properties), while `PassiveRichTextEditor` requires you to manually request updates through its public interface. The passive version handles larger content better as it doesn't have to deal with receiving new data via JS until you request it.

`RichTextEditor` example:

```html
<RichTextEditor @bind-Content="@_content"
                @bind-Text="@_text"
                @bind-Selection="@_selection"
                IsTouched="@_isTouched"
                ToolbarOptions="@ToolbarOptions.FullToolbarOptions"
                Theme="@QuillTheme.Snow"
                ... />
```

`PassiveRichTextEditor` example:

```html
<PassiveRichTextEditor @bind-Content="@_content"
                       ToolbarOptions="ToolbarOptions.FullToolbarOptions"
                       @ref="@_editorReference" />
<button @onclick="@(() => _editorReference?.UpdateContentAsync() ?? Task.CompletedTask)">
    Update content
</button>
```

Note that in the previous example the displayed content for the user is instant, but the value in `@_content` won't be updated until requested.

You can completely customize the toolbar:

```html
<RichTextEditor @bind-Content="@_content"
                ToolbarOptions="@(ToolbarOptions.FullToolbarOptions with { Fonts = new List<string> { "Sans Serif", "RobotoMono" } })">
    <ToolbarContent>
        <div style="float: left;">
            <FontControls />
            <SizeControls />
            <ColorControls />
        </div>
        <div style="float: right;">
            <InsertImageControls />
            <EmbedVideoControls />
        </div>
    </ToolbarContent>
</RichTextEditor>
```
