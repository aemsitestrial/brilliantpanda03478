# Project Knowledge Base

## Purpose

This repository is an Adobe Edge Delivery Services project designed to support:

- AEM Cloud Service authoring with Universal Editor/XWalk
- EDS document-based authoring
- DA Live authoring
- Fast, progressively enhanced published pages

The repository is document-first. Blocks should render useful authored markup before optional remote data or enhancements are available.

## Repository map

| Path                        | Responsibility                                                                    |
| --------------------------- | --------------------------------------------------------------------------------- |
| `blocks/`                   | Block JavaScript, CSS, and XWalk/DA model fragments.                              |
| `scripts/aem.js`            | Shared EDS decoration, loading, instrumentation, and utility functions.           |
| `scripts/scripts.js`        | Page bootstrap, eager/lazy loading, header/footer loading, and editor bootstrap.  |
| `scripts/decorate-main.js`  | Shared main-content decoration.                                                   |
| `scripts/editor-support.js` | Universal Editor content patch, update, move, copy, and selection handling.       |
| `scripts/endpointconfig.js` | AEM author/publish endpoint and authoring-mode detection.                         |
| `models/`                   | Shared page, section, text, title, image, button, and component metadata sources. |
| `component-definition.json` | Generated component definitions. Do not edit manually.                            |
| `component-models.json`     | Generated component models. Do not edit manually.                                 |
| `component-filters.json`    | Generated component filters. Do not edit manually.                                |
| `styles/`                   | Global, font, and lazy-loaded styles.                                             |
| `tools/sidekick/`           | Sidekick configuration.                                                           |
| `fstab.yaml`                | AEM/EDS content mount point.                                                      |
| `paths.json`                | Content and configuration path mappings.                                          |
| `helix-query.yaml`          | EDS query-index configuration.                                                    |
| `helix-sitemap.yaml`        | Sitemap source and destination configuration.                                     |
| `.vscode/mcp.json`          | Workspace Figma MCP server configuration.                                         |

## Block contract

Every block should normally contain:

```text
blocks/<block-name>/
  _<block-name>.json  # XWalk/DA definitions and model
  <block-name>.js     # default exported decorate(block)
  <block-name>.css    # block-scoped styles
```

A block should:

1. Export a default `decorate(block)` function.
2. Accept authored markup as its initial input.
3. Preserve meaningful content when optional fetches fail.
4. Avoid global selectors and unrelated DOM mutations.
5. Use semantic elements and accessible names.
6. Keep authoring instrumentation intact where possible.
7. Avoid hard-coded environment-specific endpoints.

## Metadata workflow

Block metadata is composed from `_*.json` fragments:

- Definitions are collected through `models/_component-definition.json`.
- Models are collected through `models/_component-models.json`.
- Filters are collected through `models/_component-filters.json`.
- `npm run build` regenerates the root JSON files.

Always edit the source fragment in the block directory, then run the build. Never hand-edit generated component JSON.

### Conditional XWalk fields

XWalk models support JSON-logic conditions:

```json
"condition": {
  "==": [
    { "var": "listType" },
    "children"
  ]
}
```

Use conditions for fields that only apply to one authoring choice. Keep shared fields outside the conditional container.

## Authoring modes

### Universal Editor/XWalk

XWalk uses component definitions and models to create and edit component properties. The page runtime loads the editor adapter only when Universal Editor markers are detected. Editor updates are sanitized with DOMPurify before replacement.

Important conventions:

- Preserve `data-aue-*` instrumentation.
- Keep model names synchronized with block field names.
- Use conditional fields for mode-specific options.
- Avoid importing the main page bootstrap from blocks; this can create dependency cycles.

### EDS document authoring

Document authors create a block using a table/section whose first row identifies the block. Subsequent rows hold content in model order. Blocks must work with authored links, images, and rich text without requiring XWalk-only attributes.

### DA Live

DA Live uses the DA plugin definition and field mapping. DA-compatible blocks should keep their markup predictable and use relative URLs where possible. Do not assume that Universal Editor events exist in DA Live.

## Data and remote services

### Query index

`blocks/list/list.js` reads `/query-index.json` and falls back to `/sitemap.json`.

The current `helix-query.yaml` explicitly indexes:

- `lastModified`
- `robots`

List search and tag filtering also expect index records to expose fields such as:

- `path`
- `title`
- `description`
- `tags` or `keywords`
- `lastModified`
- optional image/thumbnail fields

If those properties are not present in the generated index, client-side filtering cannot discover them. For true AEM full-text search, relevance ranking, permissions, or large datasets, use a server-side search endpoint instead of downloading the entire index.

### AEM endpoints

`getAEMPublish()` and `getAEMAuthor()` read `window.hlx.config` and fall back to the current origin. Endpoint-dependent blocks must degrade gracefully when configuration or authentication is unavailable.

## Performance rules

- Keep the eager path limited to critical page decoration and the first section.
- Load non-critical CSS and functionality lazily.
- Use optimized pictures for block images.
- Do not fetch remote data when authored content is sufficient.
- Avoid loading large libraries for small interactions.
- Prefer the query index over fetching every page individually.
- Use server-side pagination/search for very large content sets.

## Accessibility rules

- Use semantic headings, lists, links, buttons, `time`, and landmarks.
- Every meaningful image needs alternative text.
- Interactive controls must be keyboard accessible.
- Accordions, tabs, carousels, modals, and forms need visible focus and state information.
- Do not use color as the only indication of state.
- Keep heading levels configurable where the model provides that option.
- Test with keyboard navigation and a screen reader before publishing.

## Security rules

- Do not place API keys, tokens, or credentials in block JavaScript.
- Do not expose private AEM endpoints to public pages unless the endpoint is intentionally public.
- Treat fetched HTML as untrusted. Use DOMPurify where HTML must be inserted.
- Prefer `textContent` and DOM APIs over interpolating user-controlled HTML.
- Validate external embed URLs and only allow approved providers.
- Never commit `.env` files containing secrets.

## Development commands

| Command              | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `npm install`        | Install dependencies.                                  |
| `npm run lint`       | Run ESLint and Stylelint.                              |
| `npm run lint:fix`   | Apply available lint fixes.                            |
| `npm run build`      | Regenerate component metadata.                         |
| `npm run build:json` | Regenerate all component JSON explicitly.              |
| `aem up`             | Run the local AEM proxy when the AEM CLI is installed. |

Run both `npm run lint` and `npm run build` before opening a pull request.

## Adding a block checklist

- [ ] Create `blocks/<name>/<name>.js` with a default decorator.
- [ ] Create `blocks/<name>/<name>.css`.
- [ ] Create `blocks/<name>/_<name>.json`.
- [ ] Add XWalk definition and model fields.
- [ ] Add DA mapping when the block has structured document fields.
- [ ] Add conditions for mutually exclusive authoring options.
- [ ] Preserve authored fallback content.
- [ ] Add accessibility behavior and labels.
- [ ] Run lint and metadata build.
- [ ] Test published, preview, XWalk, document-authoring, and DA Live paths.
- [ ] Update `docs/author-markup.md` with author instructions.

## Troubleshooting

### Block does not appear in Universal Editor

1. Confirm the block definition exists in `blocks/<name>/_<name>.json`.
2. Run `npm run build`.
3. Confirm the generated definition exists in `component-definition.json`.
4. Confirm the model exists in `component-models.json`.
5. Check that the model ID matches the XWalk template model.

### Conditional fields do not appear

1. Confirm the condition variable matches the controlling field name exactly.
2. Confirm the option value matches the condition value exactly.
3. Run `npm run build` to regenerate metadata.
4. Reload the editor after metadata changes.

### List search or tags return no results

1. Open `/query-index.json` in the target environment.
2. Confirm records contain the fields consumed by `blocks/list/list.js`.
3. Confirm the parent path is correct.
4. Confirm tag values use the same names/casing as the authored tags.
5. Use a server-side endpoint if the required search behavior is beyond client-side filtering.

### Build fails after metadata changes

- Validate the edited `_*.json` file as JSON.
- Check model field names are unique within the model.
- Confirm conditional fields use supported JSON-logic syntax.
- Run ESLint against changed JavaScript files.
- Re-run `npm run build` after correcting the source fragment.

## Figma MCP

The workspace configuration is in `.vscode/mcp.json` and points to the hosted Figma MCP server. Authenticate through VS Code when prompted. For Figma-driven implementation, retrieve design context and a screenshot before changing UI code, then translate the result into this project’s block, style, accessibility, and authoring conventions.

## Change review standard

A change is ready when:

- It works with authored content and does not depend exclusively on remote data.
- It supports the intended XWalk, EDS document, and DA Live path.
- Its model and generated metadata are current.
- Lint and build pass.
- Accessibility, security, and performance risks are addressed.
- Author instructions are documented.
