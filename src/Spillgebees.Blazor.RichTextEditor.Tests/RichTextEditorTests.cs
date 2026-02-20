using AwesomeAssertions;

namespace Spillgebees.Blazor.RichTextEditor.Tests;

public class RichTextEditorTests : BunitContext
{
    private const string CreateEditorIdentifier = "Spillgebees.editorFunctions.createEditor";
    private const string DisposeEditorIdentifier = "Spillgebees.editorFunctions.disposeEditor";
    private const string SetContentIdentifier = "Spillgebees.editorFunctions.setContent";

    [Before(Test)]
    public void Setup()
    {
        JSInterop.Mode = JSRuntimeMode.Loose;

        JSInterop.SetupVoid(CreateEditorIdentifier);
        JSInterop.SetupVoid(DisposeEditorIdentifier);
        JSInterop.SetupVoid(SetContentIdentifier);
    }

    [Test]
    public void Should_render_editor_container()
    {
        // act
        var cut = Render<Components.RichTextEditor>();

        // assert
        var container = cut.Find("div.rich-text-editor-container");
        container.Should().NotBeNull();
    }

    [Test]
    public void Should_add_custom_css_to_container()
    {
        // act
        var cut = Render<Components.RichTextEditor>(parameters => parameters
            .Add(p => p.ContainerClass, "my-custom-class"));

        // assert
        var container = cut.Find("div.rich-text-editor-container.my-custom-class");
        container.Should().NotBeNull();
    }

    [Test]
    public void Should_trigger_editor_initialization_after_render()
    {
        // act
        Render<Components.RichTextEditor>();

        // assert
        JSInterop.VerifyInvoke(CreateEditorIdentifier);
    }

    [Test]
    [Timeout(5000)]
    public async Task Should_dispose_editor_correctly_when_js_initialization_has_finished(CancellationToken cancellationToken)
    {
        // arrange
        var cut = Render<Components.RichTextEditor>();

        // act
        cut.Instance.OnEditorInitialized();
        await cut.Instance.DisposeAsync();

        // assert
        JSInterop.VerifyInvoke(DisposeEditorIdentifier);
    }

    [Test]
    [Timeout(5000)]
    public async Task Should_dispose_editor_correctly_when_js_initialization_has_not_finished(CancellationToken cancellationToken)
    {
        // arrange
        var cut = Render<Components.RichTextEditor>();

        // act
        await cut.Instance.DisposeAsync();

        // assert
        JSInterop.VerifyInvoke(DisposeEditorIdentifier);
    }
}
