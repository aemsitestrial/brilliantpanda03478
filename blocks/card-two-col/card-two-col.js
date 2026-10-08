import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_MAX_CARDS = 2;

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
  // Extract Block Configurations
  const configuredMax = parseInt(block.dataset.maxItems, 10);
  const isValidMax = !Number.isNaN(configuredMax) && configuredMax > 0;
  const maxCards = isValidMax ? configuredMax : DEFAULT_MAX_CARDS;

  const listTitle = block.dataset.listTitle || '';
  const motionType = block.dataset.motionType || '';

  // Render Section Header
  if (listTitle) {
    const header = document.createElement('div');
    header.className = 'card-two-col-header';

    const h2 = document.createElement('h2');
    h2.className = 'card-two-col-list-title';
    h2.textContent = listTitle;
    header.append(h2);

    block.parentElement.insertBefore(header, block);
  }

  const ul = document.createElement('ul');

  // Filter out block metadata rows and cap at maxItems (2)
  const rows = [...block.children].filter((row) => {
    const firstCellText = getCellText(row.children[0]);
    return !firstCellText.toLowerCase().includes('maxitems');
  });

  const selectedRows = rows.slice(0, maxCards);

  selectedRows.forEach((row) => {
    const li = document.createElement('li');
    if (motionType) li.classList.add(motionType);
    moveInstrumentation(row, li);

    const cells = [...row.children];

    if (cells.length >= 2) {
      const [tagCell, titleCell, linkCell] = cells;

      const cardBody = document.createElement('div');
      cardBody.className = 'card-two-col-card-body';

      // Field 1: Tag
      const tagText = getCellText(tagCell);
      if (tagText) {
        const tag = document.createElement('p');
        tag.className = 'card-two-col-card-tag';
        tag.textContent = tagText;
        if (tagCell) moveInstrumentation(tagCell, tag);
        cardBody.append(tag);
      }

      // Field 2: Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'card-two-col-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        cardBody.append(title);
      }

      const href = getLinkHref(linkCell);
      if (href) {
        const linkWrapper = document.createElement('a');
        linkWrapper.className = 'card-two-col-card-link';
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

  block.textContent = '';
  block.append(ul);
}
