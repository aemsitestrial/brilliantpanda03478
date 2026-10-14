import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_MAX_CARDS = 5;

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

  const configuredMax = parseInt(block.dataset.maxItems, 10);
  const isValidMax = !Number.isNaN(configuredMax) && configuredMax > 0;
  const maxCards = isValidMax ? configuredMax : DEFAULT_MAX_CARDS;

  const rows = [...block.children].filter((row) => {
    const firstCellText = getCellText(row.children[0]);
    return !firstCellText.toLowerCase().includes('maxitems');
  });

  const selectedRows = rows.slice(0, maxCards);

  selectedRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];

    if (cells.length >= 4) {
      const [
        categoryCell,
        titleCell,
        descCell,
        bgImgCell,
        themeCell,
        textColorCell,
        ctaCell,
        linkCell,
      ] = cells;

      // Background Image
      const img = bgImgCell?.querySelector('img');
      if (img?.src) {
        li.style.backgroundImage = `url(${img.src})`;
      }

      const cardBody = document.createElement('div');
      cardBody.className = 'list-cards-card-body';

      const topContent = document.createElement('div');

      // 1. Category
      const categoryText = getCellText(categoryCell);
      if (categoryText) {
        const badge = document.createElement('p');
        badge.className = 'list-cards-card-badge';
        badge.textContent = categoryText;
        if (categoryCell) moveInstrumentation(categoryCell, badge);
        topContent.append(badge);
      }

      // 2. Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'list-cards-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        topContent.append(title);
      }

      // 3. Description
      const descText = getCellText(descCell);
      if (descText) {
        const desc = document.createElement('p');
        desc.className = 'list-cards-card-desc';
        desc.textContent = descText;
        if (descCell) moveInstrumentation(descCell, desc);
        topContent.append(desc);
      }

      // 4. Bottom CTA Label
      const bottomContent = document.createElement('div');
      const ctaText = getCellText(ctaCell) || 'Explore';
      const cta = document.createElement('div');
      cta.className = 'list-cards-card-cta';
      cta.innerHTML = `<span>${ctaText}</span><span class="cta-arrow">&rarr;</span>`;
      bottomContent.append(cta);

      cardBody.append(topContent, bottomContent);

      // Theme
      const themeVal = getCellText(themeCell).toLowerCase();
      if (themeVal) {
        li.classList.add(`theme-${themeVal}`);
      } else {
        li.classList.add('theme-dark');
      }

      // Text Color Override
      const textColorVal = getCellText(textColorCell).toLowerCase();
      if (textColorVal.includes('white')) {
        li.classList.add('text-white');
      } else if (textColorVal.includes('dark') || textColorVal.includes('gray')) {
        li.classList.add('text-dark-gray');
      }

      // Link Wrapper
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
    }

    ul.append(li);
  });

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
