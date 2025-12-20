/**
 * Performance benchmarks for TemplateRenderAction
 * Run with: npm run benchmark
 */

import { TemplateRenderAction } from "../actions/TemplateRenderAction/TemplateRenderAction";
import fs from "fs/promises";
import path from "path";

interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    itemsPerSec: number;
}

const results: BenchmarkResult[] = [];
const tmpDir = path.join(__dirname, "__benchmark_fixtures__");

async function setupFixtures() {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.mkdir(tmpDir, { recursive: true });

    // Create simple template
    await fs.writeFile(
        path.join(tmpDir, "simple.njk"),
        "<h1>{{ title }}</h1><p>{{ content }}</p>",
        "utf8",
    );

    // Create complex template with loops
    await fs.writeFile(
        path.join(tmpDir, "complex.njk"),
        `<div class="items">
{% for item in items %}
  <div class="item">
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <ul>
    {% for tag in item.tags %}
      <li>{{ tag }}</li>
    {% endfor %}
    </ul>
  </div>
{% endfor %}
</div>`,
        "utf8",
    );

    // Create nested template scenario
    await fs.mkdir(path.join(tmpDir, "nested"), { recursive: true });
    await fs.writeFile(
        path.join(tmpDir, "nested", "layout.njk"),
        `<!DOCTYPE html>
<html>
<head><title>{{ title }}</title></head>
<body>{% block content %}{% endblock %}</body>
</html>`,
        "utf8",
    );

    await fs.writeFile(
        path.join(tmpDir, "nested", "page.njk"),
        `{% extends "layout.njk" %}
{% block content %}
<h1>{{ title }}</h1>
{% include "header.njk" %}
<main>{{ body }}</main>
{% endblock %}`,
        "utf8",
    );

    await fs.writeFile(
        path.join(tmpDir, "nested", "header.njk"),
        "<header><nav>{{ navigation }}</nav></header>",
        "utf8",
    );
}

async function benchmark(name: string, fn: () => Promise<void>, iterations: number = 100) {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        times.push(end - start);
    }

    const totalTime = times.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const result: BenchmarkResult = {
        name,
        iterations,
        totalTime: Math.round(totalTime),
        avgTime: Math.round(avgTime * 100) / 100,
        minTime: Math.round(minTime * 100) / 100,
        maxTime: Math.round(maxTime * 100) / 100,
        itemsPerSec: Math.round((1000 / avgTime) * 100) / 100,
    };

    results.push(result);
    return result;
}

async function runBenchmarks() {
    console.log("🚀 Starting TemplateRenderAction Performance Benchmarks\n");

    await setupFixtures();
    const action = new TemplateRenderAction();

    // Benchmark 1: Simple template rendering
    console.log("📊 Benchmark 1: Simple template rendering");
    await benchmark(
        "Simple template (no context)",
        async () => {
            const output = path.join(tmpDir, `simple-${Date.now()}-${Math.random()}.html`);
            await action.execute({
                templatePath: path.join(tmpDir, "simple.njk"),
                outputPath: output,
            });
            await fs.rm(output, { force: true });
        },
        50,
    );

    // Benchmark 2: Template with context
    console.log("📊 Benchmark 2: Template with context");
    await benchmark(
        "Template with context",
        async () => {
            const output = path.join(tmpDir, `with-ctx-${Date.now()}-${Math.random()}.html`);
            await action.execute({
                templatePath: path.join(tmpDir, "simple.njk"),
                outputPath: output,
                context: {
                    title: "Test Page",
                    content: "Lorem ipsum dolor sit amet",
                },
            });
            await fs.rm(output, { force: true });
        },
        50,
    );

    // Benchmark 3: Template with loops (varying sizes)
    const loopSizes = [10, 50, 100];
    for (const size of loopSizes) {
        console.log(`📊 Benchmark 3: Loops with ${size} items`);
        await benchmark(
            `Loops with ${size} items`,
            async () => {
                const output = path.join(tmpDir, `loops-${Date.now()}-${Math.random()}.html`);
                const items = Array.from({ length: size }, (_, i) => ({
                    title: `Item ${i + 1}`,
                    description: `Description for item ${i + 1}`,
                    tags: ["tag1", "tag2", "tag3"],
                }));

                await action.execute({
                    templatePath: path.join(tmpDir, "complex.njk"),
                    outputPath: output,
                    context: { items },
                });
                await fs.rm(output, { force: true });
            },
            30,
        );
    }

    // Benchmark 4: Template inheritance
    console.log("📊 Benchmark 4: Template inheritance");
    await benchmark(
        "Template inheritance",
        async () => {
            const output = path.join(tmpDir, `inherit-${Date.now()}-${Math.random()}.html`);
            await action.execute({
                templatePath: path.join(tmpDir, "nested", "page.njk"),
                outputPath: output,
                searchPaths: [path.join(tmpDir, "nested")],
                context: {
                    title: "Inherited Page",
                    navigation: "Home > About > Contact",
                    body: "Page content goes here",
                },
            });
            await fs.rm(output, { force: true });
        },
        30,
    );

    // Benchmark 5: Large context object
    console.log("📊 Benchmark 5: Large context object");
    const largeContext = {
        title: "Large Context",
        content: "x".repeat(10000),
        nested: {
            level1: {
                level2: {
                    level3: {
                        data: Array.from({ length: 100 }, (_, i) => ({
                            id: i,
                            name: `Item ${i}`,
                        })),
                    },
                },
            },
        },
    };

    await benchmark(
        "Large context object",
        async () => {
            const output = path.join(tmpDir, `large-ctx-${Date.now()}-${Math.random()}.html`);
            await action.execute({
                templatePath: path.join(tmpDir, "simple.njk"),
                outputPath: output,
                context: largeContext,
            });
            await fs.rm(output, { force: true });
        },
        20,
    );

    // Print results
    console.log("\n\n📈 Benchmark Results Summary\n");
    console.log("┌─────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐");
    console.log(
        "│ Benchmark                           │ Avg (ms) │ Min (ms) │ Max (ms) │ Total    │ Items/sec    │",
    );
    console.log("├─────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤");

    for (const result of results) {
        const name = result.name.padEnd(35);
        const avg = result.avgTime.toString().padStart(8);
        const min = result.minTime.toString().padStart(8);
        const max = result.maxTime.toString().padStart(8);
        const total = `${result.totalTime}ms`.padStart(8);
        const itemsPerSec = result.itemsPerSec.toString().padStart(12);

        console.log(`│ ${name} │ ${avg} │ ${min} │ ${max} │ ${total} │ ${itemsPerSec} │`);
    }

    console.log("└─────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘");

    // Calculate averages
    const avgTime = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
    const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);

    console.log(`\n📊 Overall Statistics:`);
    console.log(`   • Average render time: ${Math.round(avgTime * 100) / 100}ms`);
    console.log(`   • Total benchmark time: ${totalTime}ms`);
    console.log(`   • Total iterations: ${results.reduce((sum, r) => sum + r.iterations, 0)}`);

    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true });
}

// Run benchmarks if this is the main module
if (require.main === module) {
    runBenchmarks().catch(console.error);
}

export { runBenchmarks, BenchmarkResult };
