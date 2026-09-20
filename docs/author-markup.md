# Author Markup Reference

This guide is the author-facing source of truth for creating blocks in AEM Cloud Service with Universal Editor/XWalk, EDS document authoring, and DA Live.

## How block markup works

In document authoring, create a block as a table or block section. The first row contains the block name. The following rows contain the authored values in the same order as the block model. In Universal Editor/XWalk, use the generated component model; the same block scripts render the resulting markup.

```text
| list |
|------|
| List Type | children |
| Parent Page | /products |
| Child Depth | 1 |
```

Use one block per section. Keep links, images, and rich text in their own cells. Do not add implementation-specific HTML unless the block instructions require it.

## Core authoring rules

- Use lowercase block names exactly as shown below.
- Prefer authored content over hard-coded content in block JavaScript.
- Use relative links for content on the same site.
- Add meaningful image alt text.
- Keep headings in logical order.
- Preview the page after changing block options.
- For XWalk, change the model field rather than manually editing generated JSON.
- For DA Live/document authoring, use the field order documented for the block.

## Block catalog

### Accordion

**Block name:** `accordion`

Use for collapsible content. Each item contains a summary and text content.

| Field     | Purpose                                         |
| --------- | ----------------------------------------------- |
| `summary` | Accordion heading shown in the collapsed state. |
| `text`    | Rich text displayed when the item is expanded.  |

Add multiple accordion items. Keep summaries short and unique.

### Article

**Block name:** `article`

Loads an AEM Content Fragment when an endpoint is configured and falls back to authored content when it is not.

| Field         | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `articlepath` | AEM Content Fragment path.                         |
| `variation`   | Content Fragment variation; use `main` when empty. |

### Blog List

**Block name:** `blog-list`

Displays blog entries from the site index and falls back to authored links.

| Field     | Purpose                        |
| --------- | ------------------------------ |
| `heading` | Optional heading for the list. |

For an authored fallback, add one link per entry with the entry title as link text.

### Cards

**Block name:** `cards`

Add one or more `card` items.

| Field      | Purpose                      |
| ---------- | ---------------------------- |
| `image`    | Card image.                  |
| `imageAlt` | Accessible alternative text. |
| `text`     | Card rich text.              |

### Carousel

**Block name:** `carousel`

Add one or more `carousel-item` items.

| Field            | Purpose                  |
| ---------------- | ------------------------ |
| `media_image`    | Slide image.             |
| `media_imageAlt` | Image alternative text.  |
| `content_text`   | Slide rich text content. |

Use meaningful slide content and do not rely on images alone to communicate information.

### Columns

**Block name:** `columns`

| Field     | Purpose              |
| --------- | -------------------- |
| `columns` | Number of columns.   |
| `rows`    | Column content rows. |

Keep each column concise and use headings where appropriate.

### DM Scene7 Template

**Block name:** `dm-scene7-template`

| Field      | Purpose                                    |
| ---------- | ------------------------------------------ |
| `image`    | Dynamic Media image or template reference. |
| `imageAlt` | Accessible alternative text.               |

### DM Video

**Block name:** `dm-video`

| Field       | Purpose                  |
| ----------- | ------------------------ |
| `thumbnail` | Video thumbnail.         |
| `videoUrl`  | Dynamic Media video URL. |

### Embed

**Block name:** `embed`

| Field                  | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `embed_placeholder`    | Placeholder image shown before loading. |
| `embed_placeholderAlt` | Placeholder alternative text.           |
| `embed_uri`            | Embed URL or source URI.                |

Only embed trusted sources. Confirm responsive behavior before publishing.

### Embed Adaptive Form

**Block name:** `embed-adaptive-form`

| Field      | Purpose                 |
| ---------- | ----------------------- |
| `formPath` | AEM Adaptive Form path. |

The form path must be available in the target author/publish environment.

### Footer

**Block name:** `footer`

Footer content is loaded from the configured footer fragment. Maintain the fragment structure and test all navigation links.

### Form

**Block name:** `form`

Forms use the form model and form component definitions. Configure the submit behavior and then add supported form components.

| Field                    | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `thankYouOption`         | Configure the post-submit behavior.            |
| `thankYouMessage`        | Rich text shown when message mode is selected. |
| `actionType`             | REST endpoint or email submission.             |
| `enableRestEndpointPost` | Enables POST submission for REST mode.         |
| `restEndpointPostUrl`    | REST submission URL.                           |
| `email`                  | Email configuration container.                 |

Use the form component models for inputs, validation, panels, wizard steps, and buttons.

### Fragment

**Block name:** `fragment`

| Field       | Purpose                     |
| ----------- | --------------------------- |
| `reference` | Content Fragment reference. |

### Header

**Block name:** `header`

Header content is loaded from the configured header fragment. Preserve navigation landmarks and accessible link text.

### Hero

**Block name:** `hero`

| Field      | Purpose                      |
| ---------- | ---------------------------- |
| `image`    | Hero image.                  |
| `imageAlt` | Accessible alternative text. |
| `text`     | Hero rich text content.      |

### List

**Block name:** `list`

The list model displays conditional fields according to `listType`.

#### Child Pages

| Field        | Purpose                                       |
| ------------ | --------------------------------------------- |
| `listType`   | Select `Child Pages`.                         |
| `parentPage` | Parent path; empty uses the current page.     |
| `childDepth` | Number of levels below the parent to include. |

#### Fixed List

| Field         | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `listType`    | Select `Fixed List`.                             |
| `fixedItems`  | Rich text/link collection.                       |
| `fixedLink`   | Link URL; repeat for multiple entries.           |
| `fixedText`   | Display text; repeat in the same order as links. |
| `fixedTarget` | Select whether an item opens in a new tab.       |

#### Search based List

| Field         | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `listType`    | Select `Search`.                                       |
| `searchQuery` | Space-separated terms matched against indexed content. |
| `searchIn`    | Parent path used as the search scope.                  |

#### Tags based list

| Field            | Purpose                            |
| ---------------- | ---------------------------------- |
| `listType`       | Select `Tags`.                     |
| `tagsParentPage` | Parent path used as the tag scope. |
| `tags`           | Comma-separated tags.              |
| `tagMatch`       | Match any tag or all tags.         |

#### Shared List Settings

| Field             | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `orderBy`         | Title or last modified date.                |
| `sortOrder`       | Ascending or descending.                    |
| `maxItems`        | Maximum number of results; empty means all. |
| `linkItems`       | Link result titles to their pages.          |
| `showDescription` | Display indexed descriptions.               |
| `showDate`        | Display the modification date.              |
| `displayAsTeaser` | Display indexed images as teasers.          |
| `dateFormat`      | Date pattern such as `MMMM d, yyyy`.        |
| `id`              | Optional unique HTML ID.                    |

Search and tag results require the relevant fields to be available in `query-index.json`.

### Modal

**Block name:** `modal`

| Field      | Purpose                     |
| ---------- | --------------------------- |
| `link`     | Modal content or modal URL. |
| `linkText` | Visible trigger text.       |

Ensure the trigger clearly describes the modal content.

### Quote

**Block name:** `quote`

| Field         | Purpose                        |
| ------------- | ------------------------------ |
| `quotation`   | Quoted content.                |
| `attribution` | Source or author of the quote. |

### Search

**Block name:** `search`

| Field     | Purpose                               |
| --------- | ------------------------------------- |
| `index`   | Search index source.                  |
| `classes` | Optional search presentation options. |

### Table

**Block name:** `table`

Select the table column layout and enter row values. Supported layouts are one through four columns. Optional classes include striped, bordered, and no-header behavior.

### Tabs

**Block name:** `tabs`

Add one or more `tabs-item` items.

| Field                 | Purpose                |
| --------------------- | ---------------------- |
| `title`               | Tab label.             |
| `content_heading`     | Content heading.       |
| `content_headingType` | Heading level.         |
| `content_image`       | Optional tab image.    |
| `content_richtext`    | Tab rich text content. |

### Teaser

**Block name:** `teaser`

The teaser supports an image, eyebrow, title, descriptions, style classes, and up to two configurable calls to action.

| Field group | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| Image       | `fileReference`, `fileReferenceAlt`.                        |
| Content     | `eyebrow`, `title`, `titleType`, `longDescr`, `shortDescr`. |
| CTA 1       | `cta1Type`, `cta1Text`, `cta1`.                             |
| CTA 2       | `cta2Type`, `cta2Text`, `cta2`.                             |
| Options     | `classes`.                                                  |

### Video

**Block name:** `video`

| Field                  | Purpose                            |
| ---------------------- | ---------------------------------- |
| `uri`                  | Video source.                      |
| `classes`              | Playback options such as autoplay. |
| `placeholder_image`    | Placeholder image.                 |
| `placeholder_imageAlt` | Placeholder alternative text.      |

## Authoring-mode differences

- **Universal Editor/XWalk:** use the generated model fields and conditional groups.
- **EDS document authoring:** use block tables and authored links/content.
- **DA Live:** use the DA definition and field mapping; keep markup semantic and portable.

The rendering code must remain safe when optional fields are absent because the same block can be rendered in all three modes.
