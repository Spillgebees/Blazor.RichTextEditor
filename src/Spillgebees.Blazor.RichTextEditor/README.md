`Spillgebees.Blazor.RichTextEditor` is a WYSIWYG Blazor component powered by [Quill](https://quilljs.com/).

See the [documentation and demos](https://spillgebees.github.io/Blazor.RichTextEditor) for guides, examples, and live components.

## Features

- Two-way binding for HTML content, plain text, selection, enabled state, and touched state
- Basic, full, hidden, repositioned, or completely custom toolbars
- Snow and Bubble themes, custom fonts, accessible keybindings, and configurable event debouncing
- A passive editor for large documents and embedded content where on-demand synchronization is preferable

## Getting started

Install the package:

```shell
dotnet add package Spillgebees.Blazor.RichTextEditor
```

Load the stylesheet. In a Blazor Web App or Blazor Server app (`App.razor`), use `@Assets` to serve the fingerprinted, cache-busted file:

```razor
<link rel="stylesheet" href="@Assets["_content/Spillgebees.Blazor.RichTextEditor/Spillgebees.Blazor.RichTextEditor.lib.module.css"]" />
```

In a standalone Blazor WebAssembly app (`index.html`), use the plain path:

```html
<link rel="stylesheet" href="_content/Spillgebees.Blazor.RichTextEditor/Spillgebees.Blazor.RichTextEditor.lib.module.css" />
```

The JavaScript module and Quill load automatically with a [JS initializer](https://learn.microsoft.com/aspnet/core/blazor/fundamentals/startup#javascript-initializers).

## Quick example

```razor
@using Spillgebees.Blazor.RichTextEditor.Components
@using Spillgebees.Blazor.RichTextEditor.Components.Toolbar

<RichTextEditor @bind-Content="_content"
                ToolbarOptions="ToolbarOptions.FullToolbarOptions"
                UseAccessibleKeybindings="@true" />

@code {
    private string _content = "<p><strong>Hello from Blazor!</strong> 👋</p>";
}
```

## Acknowledgements

The component builds on ideas from [Blazored.TextEditor](https://github.com/Blazored/TextEditor),
[Vixys/TextEditor](https://github.com/Vixys/TextEditor), and
[WYSIWYGTextEditor](https://github.com/somegenericdev/WYSIWYGTextEditor).
