# Blazor.RichTextEditor — Project Agent Instructions

This project follows the [global AGENTS.md conventions](~/.config/opencode/AGENTS.md).
Project-specific deviations and patterns are documented below.

## Project Overview

**Spillgebees.Blazor.RichTextEditor** is a WYSIWYG Blazor component library powered by [Quill](https://quilljs.com/).
It supports Blazor Server, WebAssembly, and the unified .NET 8+ web app model.

## Architecture

### Solution structure

```
Spillgebees.Blazor.RichTextEditor.slnx          # XML solution (root)
├── src/Spillgebees.Blazor.RichTextEditor/        # Razor Class Library (NuGet package)
├── src/Spillgebees.Blazor.RichTextEditor.Assets/ # TypeScript/CSS source (Vite + pnpm)
├── src/Spillgebees.Blazor.RichTextEditor.Tests/  # TUnit + bUnit tests
└── src/Spillgebees.Blazor.RichTextEditor.Samples/
    ├── Samples.Shared/                           # Shared sample components
    ├── Samples.Server/                           # Blazor Server sample
    ├── Samples.Wasm/                             # Blazor WASM sample
    └── Samples.WebApp/                           # .NET 8+ unified web app sample
```

### JS/CSS build pipeline

TypeScript source lives in `src/Spillgebees.Blazor.RichTextEditor.Assets/`.
The main `.csproj` has MSBuild targets (`PnpmInstall`, `PnpmBuild`, `PnpmClean`)
that invoke `pnpm install` and `vite build`, outputting to
`src/Spillgebees.Blazor.RichTextEditor/wwwroot/`.

- **Entry**: `src/index.ts` (Blazor JS initializer lifecycle hooks)
- **Bundler**: Vite (library mode, ES2022, ESM)
- **Output**: `Spillgebees.Blazor.RichTextEditor.lib.module.{js,css}`
- **Linter**: Biome
- **Tests**: Vitest + jsdom

### JS interop pattern

Uses Blazor's JS initializer pattern with a global `window.Spillgebees` namespace.
The C# side calls into `Spillgebees.editorFunctions.*` via `IJSRuntime`.

### Multi-targeting

The library targets `net8.0;net9.0;net10.0` (configured in `src/General.targets`).
ASP.NET Core package versions are pinned per-TFM in `src/Directory.Packages.props`.

## Testing

- **.NET**: TUnit + AwesomeAssertions + bUnit (5 tests)
- **TypeScript**: Vitest + jsdom (32 tests across 5 files)
- Run .NET tests: `dotnet test --solution Spillgebees.Blazor.RichTextEditor.slnx`
- Run TS tests: `pnpm run test` (from `src/Spillgebees.Blazor.RichTextEditor.Assets/`)

## Dev tooling

- **CSharpier**: formats `.cs`, `.csproj`, `.props`, `.targets`, `.slnx`, `.xml`
- **Husky.Net**: pre-commit hook runs CSharpier on staged files
- **Biome**: formats + lints TypeScript (configured in `src/.../Assets/biome.json`)
