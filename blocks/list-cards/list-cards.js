import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Configuration parameter based on sheet spec: Maximum - 4
const MAX_CARDS = 4;

const VALID_THEMES = ['dark', 'light', 'blue', 'light-fade'];

/**
 * Normalizes theme name string to class slug
 */
function normalizeTheme(theme) {
  if (!theme) return '';
  const lower = theme.trim().toLowerCase();
  if (lower.includes('dark') || lower.includes('navy')) return 'dark';
  if (lower.includes('blue')) return 'blue';
  if (lower.includes('fade')) return 'light-fade';
  if (lower.includes('light') || lower.includes('gray') || lower.includes('grey')) return 'light';
  return VALID_THEMES.includes(lower) ? lower : '';
}

/**
 * Applies background theme and text color classes
 */
function applyTheme(li) {
  const themeField = li.querySelector('[data-theme]');
  if (themeField) {
    const theme = normalizeTheme(themeField.dataset.theme);
    if (theme) li.classList.add(`theme-${theme}`);
    themeField.remove();
    return;
  }

  // Fallback theme extraction from body elements
  const body = li.querySelector('.list-cards-card-body');
  const firstBlock = body?.firstElementChild;
  const fallbackTheme = normalizeTheme(firstBlock?.textContent);
  if (fallbackTheme) {
    li.classList.add(`theme-${fallbackTheme}`);
    if (firstBlock.childElementCount === 0) {
      firstBlock.remove();
    }
  }
}

function getCellText(cell) {
  if (!cell) return '';
  return cell.querySelector('p, div, span')?.textContent?.trim() || cell.textContent?.trim() || '';
}

function getLinkHref(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector('a[href]');
  if (anchor) return anchor.href;
  const text = cell.textContent?.trim() || '';
  if (/^(https?:\/\/|\/)/i.test(text)) {
    return text;
  }
  return '';
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  // Rule: Tag Result Type - 1 card each (Deduplicates category tags)
  const seenTags = new Set();

  const selectedRows = [...block.children]
    .filter((row) => {
      const cells = [...row.children];
      let tagText = '';

      if (cells.length >= 4) {
        // Multi-column schema: [category, title, theme, textColor, link]
        tagText = getCellText(cells[0]).toUpperCase();
      } else {
        // Legacy 2-column or 1-column layout
        const bodyDiv = cells[1] || cells[0];
        const tagPara = bodyDiv?.querySelector('p:first-child');
        tagText = tagPara?.textContent?.trim()?.toUpperCase() || '';
      }

      if (tagText) {
        if (seenTags.has(tagText)) {
          return false; // Skip duplicate tag
        }
        seenTags.add(tagText);
      }
      return true;
    })
    .slice(0, MAX_CARDS); // Maximum - 4

  // Build LI Elements
  selectedRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];

    if (cells.length >= 4) {
      // Authored via multi-field model:
      // cell 0: category, cell 1: title, cell 2: theme, cell 3: textColor, cell 4 (optional): link
      const [categoryCell, titleCell, themeCell, textColorCell, linkCell] = cells;

      const cardBody = document.createElement('div');
      cardBody.className = 'list-cards-card-body';

      const categoryText = getCellText(categoryCell);
      if (categoryText) {
        const badge = document.createElement('p');
        badge.className = 'list-cards-card-badge';
        badge.textContent = categoryText;
        if (categoryCell) moveInstrumentation(categoryCell, badge);
        cardBody.append(badge);
      }

      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'list-cards-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        cardBody.append(title);
      }

      const themeVal = normalizeTheme(getCellText(themeCell));
      if (themeVal) {
        li.classList.add(`theme-${themeVal}`);
      }

      const textColorVal = getCellText(textColorCell).toLowerCase();
      if (textColorVal.includes('white')) {
        li.classList.add('text-white');
      } else if (textColorVal.includes('dark') || textColorVal.includes('gray') || textColorVal.includes('grey')) {
        li.classList.add('text-dark-gray');
      }

      const href = getLinkHref(linkCell);
      if (href) {
        const linkWrapper = document.createElement('a');
        linkWrapper.className = 'list-cards-card-link';
        linkWrapper.href = href;
        if (linkCell) moveInstrumentation(linkCell, linkWrapper);
        linkWrapper.append(cardBody);
        li.append(linkWrapper);
      } else {
        li.append(cardBody);
      }
    } else {
      // Legacy 1-2 column layout
      while (row.firstElementChild) li.append(row.firstElementChild);

      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'list-cards-card-image';
        } else {
          div.className = 'list-cards-card-body';

          const firstPara = div.querySelector('p:first-child');
          if (firstPara && !firstPara.querySelector('a')) {
            firstPara.classList.add('list-cards-card-badge');
          }
        }
      });
      applyTheme(li);

      // Check if there is an anchor link in the body
      const anchor = li.querySelector('.list-cards-card-body a[href]');
      if (anchor) {
        const linkWrapper = document.createElement('a');
        linkWrapper.className = 'list-cards-card-link';
        linkWrapper.href = anchor.href;
        const bodyDiv = li.querySelector('.list-cards-card-body');
        if (anchor.parentElement && anchor.parentElement.tagName === 'P' && anchor.parentElement.children.length === 1) {
          anchor.parentElement.remove();
        } else {
          anchor.remove();
        }
        if (bodyDiv) {
          linkWrapper.append(bodyDiv);
          li.append(linkWrapper);
        }
      }
    }

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
