# Card Component Block

## Overview

The Card Component block renders a responsive grid of content cards from authored rows. Each row in the block becomes one card with a title, description, stats list, and call-to-action link.

The block is designed for Universal Editor authoring through the `card-component` model and does not depend on product data, client-side state, or external services.

## Integration

### Block Configuration

This block does not read block config values from `readBlockConfig()`. All content is supplied through the authored model fields below.

### Authoring Model Fields

| Field | Type | Effect |
|-------|------|--------|
| `title` | text | Renders the main card heading. |
| `description` | richtext | Renders the body copy for the card. |
| `stats` | richtext | Renders as a list inside the stats area; each authored list item is preserved as markup. |
| `buttonLink` | aem-content | Supplies the CTA link and label. If missing, the block falls back to `#`. |

### URL Parameters

This block does not use URL parameters.

### Local Storage

This block does not use localStorage.

### Events

The block does not listen for or emit custom events.

## Behavior Patterns

### Page Context Detection

- The block treats each child row as a separate card.
- If the block has no rows, it exits without rendering any cards.
- The block adds the `card-component` class to the wrapper before rendering.

### User Interaction Flows

1. Author content in the block model using one row per card.
2. The decorator extracts the row fields and maps them to the card layout.
3. The block renders a card grid with category, title, description, stats, and button content.
4. Users can follow the CTA link when a button is present.

### Error Handling

- Missing category, title, description, stats, or button text simply omits that portion of the card.
- Missing button links fall back to `#` so the button remains renderable.
- Empty rows are ignored rather than causing render failures.
- Rich text content is rendered as supplied, so malformed authored markup should be corrected in the source content.