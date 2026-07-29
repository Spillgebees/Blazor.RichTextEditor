# Blazor.RichTextEditor — Project Agent Instructions

## Project Overview

**Spillgebees.Blazor.RichTextEditor** is a WYSIWYG Blazor component library powered by [Quill](https://quilljs.com/).
It supports Blazor Server, WebAssembly, and the unified .NET 8+ web app model.

## Architecture

### Solution structure

```text
Spillgebees.Blazor.RichTextEditor.slnx                    # XML solution (root)
├── src/Spillgebees.Blazor.RichTextEditor/                # Razor Class Library (NuGet package)
├── src/Spillgebees.Blazor.RichTextEditor.Assets/         # TypeScript/CSS source (Vite + pnpm)
├── src/Spillgebees.Blazor.RichTextEditor.Tests/          # TUnit + bUnit tests
└── src/Spillgebees.Blazor.RichTextEditor.Docs/           # Blazor.Docs.Sdk site and live samples
```

### JS/CSS build pipeline

TypeScript source lives in `src/Spillgebees.Blazor.RichTextEditor.Assets/`, which has its own
`.csproj` using the `Microsoft.Build.NoTargets` SDK (single-targeted, `netstandard2.0`).
It owns the MSBuild targets (`PnpmInstall`, `PnpmBuild`, `PnpmClean`) that invoke
`pnpm install` and `vite build`, outputting to `src/Spillgebees.Blazor.RichTextEditor/wwwroot/`.

The main Razor Class Library references the Assets project via `<ProjectReference>` with
`ReferenceOutputAssembly="false"` to establish a build-order dependency. This ensures pnpm
runs once before the library's single-target build proceeds.

- **Entry**: `src/index.ts` (Blazor JS initializer lifecycle hooks)
- **Bundler**: Vite (library mode, ES2022, ESM)
- **Output**: `Spillgebees.Blazor.RichTextEditor.lib.module.{js,css}`
- **Linter**: Biome
- **Tests**: Vitest + jsdom

### JS interop pattern

Uses Blazor's JS initializer pattern with a global `window.Spillgebees` namespace.
The C# side calls into `Spillgebees.RichTextEditor.*` via `IJSRuntime`.

### Multi-targeting

The library targets `net10.0` (configured in `src/General.targets`).
ASP.NET Core package versions are pinned once in `src/Directory.Packages.props`.

### Documentation

The WebAssembly documentation project uses `Spillgebees.Blazor.Docs.Sdk`. Pages live under
`Pages/`, live examples under `Samples/`, and public API metadata is generated from the library
project reference marked with `DocsApi="true"`.

## Testing

- **.NET**: TUnit + AwesomeAssertions + bUnit
- **TypeScript**: Vitest + jsdom
- Run .NET tests: `dotnet test --solution Spillgebees.Blazor.RichTextEditor.slnx`
- Run TS tests: `pnpm run test` (from `src/Spillgebees.Blazor.RichTextEditor.Assets/`)

## Dev tooling

- **CSharpier**: formats `.cs`, `.csproj`, `.props`, `.targets`, `.slnx`, `.xml`
- **Husky.Net**: pre-commit hook runs CSharpier on staged files
- **Biome**: formats + lints TypeScript (configured in `src/Spillgebees.Blazor.RichTextEditor.Assets/biome.json`)
