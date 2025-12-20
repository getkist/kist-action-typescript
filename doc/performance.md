# Performance Guide

## Rendering Performance

### Context Loading
- **YAML parsing:** ~10-50ms per file depending on size
- **JSON parsing:** ~5-20ms per file
- **Recommendation:** Pre-parse and cache context files if rendering multiple templates with same data

```yaml
options:
  contextFiles:
    - ./data/shared.yml  # Parsed once per execute
  context:
    page: "home"
```

### Template Compilation
- **First render:** ~20-50ms (includes compilation)
- **Subsequent renders:** ~5-10ms (cached)
- **Recommendation:** Reuse action instance for multiple templates

### Large Templates
- **Optimal size:** <100KB per template
- **Scaling:** Fragment into includes/extends for maintainability
- **Memory:** ~2-5MB per template in memory during rendering

## Optimization Tips

### 1. Use Template Inheritance
Instead of duplicating layout:
```nunjucks
{# layout.njk #}
<!DOCTYPE html>
<html>
  <body>{% block content %}{% endblock %}</body>
</html>

{# page.njk #}
{% extends "layout.njk" %}
{% block content %}Page content{% endblock %}
```

### 2. Minimize Context Size
```yaml
# ✅ Good: Only include needed data
context:
  title: "Page"
  items: [1, 2, 3]

# ❌ Avoid: Large objects not used in template
context:
  largeObject: {...}
  allUsers: [...]
```

### 3. Use Filters Wisely
```nunjucks
{# ✅ Filter at template time #}
{% for item in items | sort %}

{# ❌ Avoid complex filter chains #}
{% for item in items | filter | map | reduce %}
```

### 4. Enable Block Trimming
```yaml
options:
  trimBlocks: true      # Removes newlines after blocks
  lstripBlocks: true    # Removes leading whitespace
```

Result: Smaller output files, faster I/O.

## Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Parse YAML (5KB) | 10ms | Varies with complexity |
| Compile template | 20ms | First time only |
| Render template | 5-10ms | Cached compilation |
| Write file (10KB) | 2ms | File I/O |

## Best Practices

1. **Cache context:** Don't reload same data files
2. **Batch renders:** Process multiple templates in sequence
3. **Stream large outputs:** Use partial templates
4. **Monitor memory:** Watch during large batch operations
5. **Use CDN/Cache:** For static assets referenced in templates

## Profiling

Enable logging to measure performance:

```typescript
import { TemplateRenderAction } from '@kist/action-jinja';

const action = new TemplateRenderAction();
const start = Date.now();

await action.execute({
  templatePath: './template.njk',
  outputPath: './output.html',
  context: { /* ... */ }
});

console.log(`Rendered in ${Date.now() - start}ms`);
```

## Scaling

For production pipelines:
- Render templates in parallel (separate steps)
- Use worker pools for batch operations
- Implement caching layer for static content
- Monitor disk I/O for large batches

See [Usage Guide](./usage.md) for parallel execution examples.
