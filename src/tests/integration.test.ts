import { TemplateRenderAction } from "../actions/TemplateRenderAction/TemplateRenderAction";
import fs from "fs/promises";
import path from "path";

describe("TemplateRenderAction Integration Tests", () => {
    const tmpDir = path.join(__dirname, "__integration_fixtures__");
    const templateDir = path.join(tmpDir, "templates");
    const dataDir = path.join(tmpDir, "data");
    const outputDir = path.join(tmpDir, "output");

    beforeAll(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
        await fs.mkdir(templateDir, { recursive: true });
        await fs.mkdir(dataDir, { recursive: true });
        await fs.mkdir(outputDir, { recursive: true });

        // Create layout template
        await fs.writeFile(
            path.join(templateDir, "layout.njk"),
            `<!DOCTYPE html>
<html>
  <head><title>{{ title }}</title></head>
  <body>{% block content %}{% endblock %}</body>
</html>`,
            "utf8",
        );

        // Create page template
        await fs.writeFile(
            path.join(templateDir, "page.njk"),
            `{% extends "layout.njk" %}
{% block content %}
<h1>{{ title }}</h1>
<ul>
{% for item in items %}
  <li>{{ item }}</li>
{% endfor %}
</ul>
{% endblock %}`,
            "utf8",
        );

        // Create context file
        await fs.writeFile(
            path.join(dataDir, "config.yml"),
            "title: My Page\nitems:\n  - First\n  - Second\n  - Third",
            "utf8",
        );
    });

    afterAll(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it("renders template with inheritance and context file", async () => {
        const action = new TemplateRenderAction();
        const outputPath = path.join(outputDir, "page.html");

        await action.execute({
            templatePath: path.join(templateDir, "page.njk"),
            outputPath,
            contextFiles: [path.join(dataDir, "config.yml")],
            searchPaths: [templateDir],
        });

        const content = await fs.readFile(outputPath, "utf8");
        expect(content).toContain("<title>My Page</title>");
        expect(content).toContain("<h1>My Page</h1>");
        expect(content).toContain("<li>First</li>");
        expect(content).toContain("<li>Second</li>");
        expect(content).toContain("<li>Third</li>");
    });

    it("merges multiple context files", async () => {
        const action = new TemplateRenderAction();
        const outputPath = path.join(outputDir, "merged.html");

        // Create additional context file
        const extraConfigPath = path.join(dataDir, "extra.yml");
        await fs.writeFile(
            extraConfigPath,
            "author: John Doe\nversion: 1.0.0",
            "utf8",
        );

        // Create template that uses both
        const templatePath = path.join(templateDir, "merged.njk");
        await fs.writeFile(
            templatePath,
            `<h1>{{ title }}</h1>
<p>Author: {{ author }}</p>
<p>Version: {{ version }}</p>`,
            "utf8",
        );

        await action.execute({
            templatePath,
            outputPath,
            contextFiles: [path.join(dataDir, "config.yml"), extraConfigPath],
        });

        const content = await fs.readFile(outputPath, "utf8");
        expect(content).toContain("My Page");
        expect(content).toContain("John Doe");
        expect(content).toContain("1.0.0");
    });

    it("respects autoescape for HTML content", async () => {
        const action = new TemplateRenderAction();
        const outputPath = path.join(outputDir, "escaped.html");
        const templatePath = path.join(tmpDir, "escape.njk");

        await fs.writeFile(templatePath, "<p>{{ content }}</p>", "utf8");

        await action.execute({
            templatePath,
            outputPath,
            context: { content: "<script>alert('xss')</script>" },
            autoescape: true,
        });

        const content = await fs.readFile(outputPath, "utf8");
        expect(content).toContain("&lt;script&gt;");
        expect(content).not.toContain("<script>");
    });

    it("handles nested includes correctly", async () => {
        const action = new TemplateRenderAction();
        const outputPath = path.join(outputDir, "nested.html");

        // Create partial
        await fs.writeFile(
            path.join(templateDir, "partial.njk"),
            "<div>{{ message }}</div>",
            "utf8",
        );

        // Create main template
        const mainTemplate = path.join(templateDir, "main.njk");
        await fs.writeFile(
            mainTemplate,
            "{% include 'partial.njk' %}",
            "utf8",
        );

        await action.execute({
            templatePath: mainTemplate,
            outputPath,
            context: { message: "Included!" },
            searchPaths: [templateDir],
        });

        const content = await fs.readFile(outputPath, "utf8");
        expect(content).toContain("Included!");
    });
});
