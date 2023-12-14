# (WIP) Blazor.RichTextEditor

<p align="center">
    <a href="https://www.nuget.org/packages/Spillgebees.Blazor.RichTextEditor"><img alt="Nuget (with prereleases)" src="https://img.shields.io/nuget/vpre/Spillgebees.Blazor.RichTextEditor?logo=nuget&style=for-the-badge"></a>
    <img alt="GitHub Workflow Status (with branch)" src="https://img.shields.io/github/actions/workflow/status/spillgebees/Blazor.RichTextEditor/build-and-test.yml?branch=main&label=build%20%26%20test&style=for-the-badge" />
</p>

`Spillgebees.Blazor.RichTextEditor` is a [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) Blazor component enabling rich text content editing. It is powered by [Quill](https://github.com/quilljs/quill).

This component is based on a mix of the following repos:

- [chrissainty's `Blazored.TextEditor`](https://github.com/Blazored/TextEditor), the original implementation.
- [vixys' fork of `Blazored.TextEditor`](https://github.com/Vixys/TextEditor), mainly the `OnTextChanged` implementation logic.
- [somegenericdev's `WYSIWYGTextEditor`](https://github.com/somegenericdev/WYSIWYGTextEditor), mainly the more convenient usage/component structure.

## TODO

- [ ] Usage
  - [ ] recommend using JS initializer to users
- [ ] JS tests
- [ ] bUnit tests
- [ ] Publish to NuGet
- [ ] Potential firefox bug (quill blot formatter not showing up on iframes)
- [ ] Unit tests
- [x] Cleaning up samples
- [ ] Advanced usage scenarios
- [ ] Bindable properties (html/content)
- [ ] IsTouched property
- [ ] Ensure .net 7 & 8 compatibility
- [x] Use JS initializer for loading script references and initializing our own JS stuff
- [ ] Provide a way to load KaTex by with some configuration flag?
- [ ] Replace the current JS initializer implementation with an npm/typescript module that generates the JS initializer for us, this should bundle all js files and css styles in one
