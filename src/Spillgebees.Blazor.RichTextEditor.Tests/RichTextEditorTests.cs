using AwesomeAssertions;

namespace Spillgebees.Blazor.RichTextEditor.Tests;

public class RichTextEditorTests : BunitContext
{
    private const string CreateEditorIdentifier = "Spillgebees.editorFunctions.createEditor";
    private const string DisposeEditorIdentifier = "Spillgebees.editorFunctions.disposeEditor";
    private const string SetContentIdentifier = "Spillgebees.editorFunctions.setContent";

    /// <summary>
    /// Timeout in milliseconds for tests to prevent hanging.
    /// </summary>
    private const int TestTimeoutMs = 5000;

    public RichTextEditorTests()
    {
        JSInterop.Mode = JSRuntimeMode.Loose;

        JSInterop.SetupVoid(CreateEditorIdentifier);
        JSInterop.SetupVoid(DisposeEditorIdentifier);
        JSInterop.SetupVoid(SetContentIdentifier);
    }

    [Fact(Timeout = TestTimeoutMs)]
    public void Should_render_editor_container()
    {
        // act
        var cut = Render<Components.RichTextEditor>();

        // assert
        var container = cut.Find("div.rich-text-editor-container");
        container.Should().NotBeNull();
    }

    [Fact(Timeout = TestTimeoutMs)]
    public void Should_add_custom_css_to_container()
    {
        // act
        var cut = Render<Components.RichTextEditor>(parameters => parameters
            .Add(p => p.ContainerClass, "my-custom-class"));

        // assert
        var container = cut.Find("div.rich-text-editor-container.my-custom-class");
        container.Should().NotBeNull();
    }

    [Fact(Timeout = TestTimeoutMs)]
    public void Should_trigger_editor_initialization_after_render()
    {
        // act
        Render<Components.RichTextEditor>();

        // assert
        JSInterop.VerifyInvoke(CreateEditorIdentifier);
    }

    [Fact(Timeout = TestTimeoutMs)]
    public async Task Should_dispose_editor_correctly_when_js_initialization_has_finished()
    {
        // arrange
        var cut = Render<Components.RichTextEditor>();

        // act
        // simulate editor initialization completion
        cut.Instance.OnEditorInitialized();
        await cut.Instance.DisposeAsync();

        // assert
        JSInterop.VerifyInvoke(DisposeEditorIdentifier);
    }

    [Fact(Timeout = TestTimeoutMs)]
    public async Task Should_dispose_editor_correctly_when_js_initialization_has_not_finished()
    {
        // arrange
        var cut = Render<Components.RichTextEditor>();

        // act
        await cut.Instance.DisposeAsync();

        // assert
        JSInterop.VerifyInvoke(DisposeEditorIdentifier);
    }
}
