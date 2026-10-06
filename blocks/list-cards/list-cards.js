import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Configuration parameter based on sheet spec: Maximum - 4
const MAX_CARDS = 4;

/**
 * Applies background theme classes derived from authoring metadata or fallback text
 */
function applyTheme(li) {
  const themeField = li.querySelector('[data-theme]');
  const body = li.querySelector('.list-cards-card-body');

  if (themeField) {
    const theme = themeField.dataset.theme?.trim()?.toLowerCase();
    if (theme) {
      li.classList.add(`theme-${theme}`);
    }
    themeField.remove();
    return;
  }

  // Fallback theme extraction from block content
  const firstBlock = body?.firstElementChild;
  const fallbackTheme = firstBlock?.textContent?.trim()?.toLowerCase();
  if (['dark', 'light', 'blue', 'light-fade'].includes(fallbackTheme)) {
    li.classList.add(`theme-${fallbackTheme}`);
    if (firstBlock.childElementCount === 0) {
      firstBlock.remove();
    }
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  // Rule: Tag Result Type - 1 card each (Deduplicates category tags)
  const seenTags = new Set();

  const selectedRows = [...block.children]
    .filter((row) => {
      const bodyDiv = row.children[1] || row.children[0];
      const tagPara = bodyDiv?.querySelector('p:first-child');
      const tagText = tagPara?.textContent?.trim()?.toUpperCase();

      if (tagText) {
        if (seenTags.has(tagText)) {
          return false; // Skip duplicate tag
        }
        seenTags.add(tagText);
      }
      return true;
    })
    .slice(0, MAX_CARDS); // Maximum - 4

  // Build LI Elements using .forEach()
  selectedRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'list-cards-card-image';
      } else {
        div.className = 'list-cards-card-body';

        // Format Category Badge (Display - Tag)
        const firstPara = div.querySelector('p:first-child');
        if (firstPara && !firstPara.querySelector('a')) {
          firstPara.classList.add('list-cards-card-badge');
        }
      }
    });

    applyTheme(li);
    ul.append(li);
  });

  // Optimize Images if present
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
