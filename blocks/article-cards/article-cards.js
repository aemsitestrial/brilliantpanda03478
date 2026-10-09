import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_MAX_CARDS = 4;

function getCellText(cell) {
  if (!cell) return '';
  return cell.querySelector('p, div, span')?.textContent?.trim()
    || cell.textContent?.trim()
    || '';
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
  const configuredMax = parseInt(block.dataset.maxItems, 10);
  const isValidMax = !Number.isNaN(configuredMax) && configuredMax > 0;
  const maxCards = isValidMax ? configuredMax : DEFAULT_MAX_CARDS;

  const ul = document.createElement('ul');

  const rows = [...block.children].filter((row) => {
    const firstCellText = getCellText(row.children[0]);
    return !firstCellText.toLowerCase().includes('maxitems');
  });

  const selectedRows = rows.slice(0, maxCards);

  selectedRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];

    if (cells.length >= 8) {
      const [
        typeCell, imgCell, catCell, readCell,
        titleCell, descCell, contentTypeCell, dateCell, linkCell, ctaCell,
      ] = cells;

      const isFeatured = getCellText(typeCell).toLowerCase() === 'featured';
      li.classList.add(isFeatured ? 'card-featured' : 'card-standard');

      if (isFeatured) {
        // Featured Overlay Card Structure
        const overlineText = getCellText(catCell);
        const titleText = getCellText(titleCell);
        const descText = getCellText(descCell);
        const href = getLinkHref(linkCell);
        const btnText = getCellText(ctaCell) || 'Button';

        const topDiv = document.createElement('div');

        if (overlineText) {
          const overline = document.createElement('div');
          overline.className = 'featured-overline';
          overline.textContent = overlineText;
          topDiv.append(overline);
        }

        if (titleText) {
          const title = document.createElement('h3');
          title.className = 'featured-title';
          title.textContent = titleText;
          topDiv.append(title);
        }

        if (descText) {
          const desc = document.createElement('p');
          desc.className = 'featured-desc';
          desc.textContent = descText;
          topDiv.append(desc);
        }

        li.append(topDiv);

        if (href) {
          const btn = document.createElement('a');
          btn.className = 'featured-btn';
          btn.href = href;
          btn.textContent = `${btnText} →`;
          li.append(btn);
        }
      } else {
        // Standard Card Structure
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'card-image-wrapper';
        const img = imgCell?.querySelector('img');

        if (img) {
          const pic = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]);
          imgWrapper.append(pic);
        }
        li.append(imgWrapper);

        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';

        const catText = getCellText(catCell);
        const readTime = getCellText(readCell);
        if (catText) {
          const meta = document.createElement('div');
          meta.className = 'card-meta';
          meta.textContent = readTime ? `${catText} | | ${readTime}` : `${catText} | |`;
          cardContent.append(meta);
        }

        const titleText = getCellText(titleCell);
        if (titleText) {
          const title = document.createElement('h3');
          title.className = 'card-title';
          title.textContent = titleText;
          cardContent.append(title);
        }

        const cType = getCellText(contentTypeCell);
        const dText = getCellText(dateCell);
        if (cType || dText) {
          const footerInfo = document.createElement('div');
          footerInfo.className = 'card-footer-info';
          footerInfo.textContent = `${cType} | ${dText}`;
          cardContent.append(footerInfo);
        }

        const href = getLinkHref(linkCell);
        if (href) {
          const linkWrapper = document.createElement('a');
          linkWrapper.style.textDecoration = 'none';
          linkWrapper.href = href;
          linkWrapper.append(cardContent);
          li.append(linkWrapper);
        } else {
          li.append(cardContent);
        }
      }
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
