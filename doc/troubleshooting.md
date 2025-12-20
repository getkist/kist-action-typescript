# Troubleshooting

## Template not rendering

**Issue:** Template file is found but output is empty or incorrect.

**Solutions:**
1. Verify template syntax matches Nunjucks/Jinja2 specification
2. Check context data is correctly formatted and provided
3. Enable debug logging to see template processing details
4. Ensure search paths are correct if using includes/extends

```yaml
options:
  templatePath: ./templates/page.njk
  outputPath: ./dist/page.html
  context:
    debug: true
  searchPaths:
    - ./templates
    - ./shared
```

## File not found errors

**Issue:** "ENOENT: no such file or directory"

**Solutions:**
1. Use absolute or relative paths consistently
2. Verify template and output paths exist (or are creatable)
3. Check file permissions in the output directory
4. Ensure context files exist before execution

```yaml
options:
  templatePath: ${PWD}/templates/page.njk  # Use full path
  outputPath: ./dist/page.html
  contextFiles:
    - ./data/config.yml  # Verify file exists
```

## Context not merging correctly

**Issue:** Context files not overriding inline context or vice versa.

**Note:** Context files are loaded first, then inline context overrides them. Ensure proper key naming.

```yaml
options:
  contextFiles:
    - ./data/defaults.yml  # Loaded first
  context:
    title: "Override"     # This overrides contextFiles
```

## Encoding issues

**Issue:** Output file has incorrect character encoding or mojibake.

**Solutions:**
1. Specify explicit encoding matching source template
2. Verify template source encoding
3. Check output file encoding setting

```yaml
options:
  templatePath: ./templates/page.njk
  outputPath: ./dist/page.html
  outputEncoding: utf8  # Explicitly set encoding
```

## Large file timeouts

**Issue:** Template rendering times out with large templates.

**Solutions:**
1. Break large templates into smaller includes
2. Reduce context data size
3. Use simpler template logic
4. Process files in parallel (multiple steps)

## Autoescape escaping too much

**Issue:** HTML content is being escaped when it shouldn't be.

**Solutions:**
1. Use `| safe` filter in template for trusted content
2. Disable autoescape if content is pre-validated
3. Use custom filters for conditional escaping

```yaml
options:
  autoescape: false  # Only if content is trusted
  context:
    htmlContent: "<p>Safe HTML</p>"
```

## Memory usage high

**Issue:** Action consumes excessive memory with large templates.

**Solutions:**
1. Process smaller batches of templates
2. Clear context between renders
3. Use streaming for very large files (see Performance Guide)

## Getting Help

- Check examples in `doc/examples.md`
- Review [Nunjucks documentation](https://mozilla.github.io/nunjucks/)
- Open an issue on GitHub with reproduction steps
