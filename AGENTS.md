# Blazor.RichTextEditor — Project Agent Instructions

## Project Overview

**Spillgebees.Blazor.RichTextEditor** is a WYSIWYG Blazor component library powered by [Quill](https://quilljs.com/).
It supports Blazor Server, WebAssembly, and the unified .NET 8+ web app model.

## Architecture

### Solution structure

```
Spillgebees.Blazor.RichTextEditor.slnx                    # XML solution (root)
├── src/Spillgebees.Blazor.RichTextEditor/                # Razor Class Library (NuGet package)
├── src/Spillgebees.Blazor.RichTextEditor.Assets/         # TypeScript/CSS source (Vite + pnpm)
├── src/Spillgebees.Blazor.RichTextEditor.Tests/          # TUnit + bUnit tests
└── src/Spillgebees.Blazor.RichTextEditor.Samples/
    ├── Spillgebees.Blazor.RichTextEditor.Samples.Shared/ # Shared sample components
    ├── Spillgebees.Blazor.RichTextEditor.Samples.Server/ # Blazor Server sample
    ├── Spillgebees.Blazor.RichTextEditor.Samples.Wasm/   # Blazor WASM sample
    └── Spillgebees.Blazor.RichTextEditor.Samples.WebApp/ # .NET 8+ unified web app sample
```

### JS/CSS build pipeline

TypeScript source lives in `src/Spillgebees.Blazor.RichTextEditor.Assets/`, which has its own
`.csproj` using the `Microsoft.Build.NoTargets` SDK (single-targeted, `netstandard2.0`).
It owns the MSBuild targets (`PnpmInstall`, `PnpmBuild`, `PnpmClean`) that invoke
`pnpm install` and `vite build`, outputting to `src/Spillgebees.Blazor.RichTextEditor/wwwroot/`.

The main Razor Class Library references the Assets project via `<ProjectReference>` with
`ReferenceOutputAssembly="false"` to establish a build-order dependency. This ensures pnpm
runs exactly once before any of the library's multi-targeted inner builds proceed.

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

- **.NET**: TUnit + AwesomeAssertions + bUnit
- **TypeScript**: Vitest + jsdom
- Run .NET tests: `dotnet test --solution Spillgebees.Blazor.RichTextEditor.slnx`
- Run TS tests: `pnpm run test` (from `src/Spillgebees.Blazor.RichTextEditor.Assets/`)

## Dev tooling

- **CSharpier**: formats `.cs`, `.csproj`, `.props`, `.targets`, `.slnx`, `.xml`
- **Husky.Net**: pre-commit hook runs CSharpier on staged files
- **Biome**: formats + lints TypeScript (configured in `src/Spillgebees.Blazor.RichTextEditor.Assets/biome.json`)
