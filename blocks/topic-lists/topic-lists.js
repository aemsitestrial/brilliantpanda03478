import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_MAX_CARDS = 3;

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
  const viewAllTitle = block.dataset.viewAllTitle || '';
  const viewAllLink = block.dataset.viewAllLink || '';
  const motionType = block.dataset.motionType || '';

  // Render Section Header
  if (listTitle || viewAllTitle) {
    const header = document.createElement('div');
    header.className = 'topic-lists-header';

    if (listTitle) {
      const h2 = document.createElement('h2');
      h2.className = 'topic-lists-list-title';
      h2.textContent = listTitle;
      header.append(h2);
    }

    if (viewAllTitle && viewAllLink) {
      const link = document.createElement('a');
      link.className = 'topic-lists-view-all';
      link.href = viewAllLink;
      link.textContent = `${viewAllTitle} →`;
      header.append(link);
    }

    block.parentElement.insertBefore(header, block);
  }

  const ul = document.createElement('ul');

  // Filter out block metadata rows and cap at maxItems (3)
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
      cardBody.className = 'topic-lists-card-body';

      // Field 1: Tag
      const tagText = getCellText(tagCell);
      if (tagText) {
        const tag = document.createElement('p');
        tag.className = 'topic-lists-card-tag';
        tag.textContent = tagText;
        if (tagCell) moveInstrumentation(tagCell, tag);
        cardBody.append(tag);
      }

      // Field 2: Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'topic-lists-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        cardBody.append(title);
      }

      const href = getLinkHref(linkCell);
      if (href) {
        const linkWrapper = document.createElement('a');
        linkWrapper.className = 'topic-lists-card-link';
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
