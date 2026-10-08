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
  // Extract Block Configurations
  const configuredMax = parseInt(block.dataset.maxItems, 10);
  const isValidMax = !Number.isNaN(configuredMax) && configuredMax > 0;
  const maxCards = isValidMax ? configuredMax : DEFAULT_MAX_CARDS;

  const listTitle = block.dataset.listTitle || '';
  const viewAllTitle = block.dataset.viewAllTitle || '';
  const viewAllLink = block.dataset.viewAllLink || '';
  const reportCtaTitle = block.dataset.reportCtaTitle || 'Read Report';
  const motionType = block.dataset.motionType || '';

  // Render Section Header
  if (listTitle || viewAllTitle) {
    const header = document.createElement('div');
    header.className = 'list-table-header';

    if (listTitle) {
      const h2 = document.createElement('h2');
      h2.className = 'list-table-list-title';
      h2.textContent = listTitle;
      header.append(h2);
    }

    if (viewAllTitle && viewAllLink) {
      const link = document.createElement('a');
      link.className = 'list-table-view-all';
      link.href = viewAllLink;
      link.textContent = `${viewAllTitle} →`;
      header.append(link);
    }

    block.parentElement.insertBefore(header, block);
  }

  const ul = document.createElement('ul');

  // Filter out block metadata rows and cap at maxItems (4)
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
      const [titleCell, descCell, linkCell] = cells;

      const cardBody = document.createElement('div');
      cardBody.className = 'list-table-card-body';

      const contentBox = document.createElement('div');
      contentBox.className = 'list-table-content';

      // Display Field 1: Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'list-table-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        contentBox.append(title);
      }

      // Display Field 2: Description
      const descText = getCellText(descCell);
      if (descText) {
        const desc = document.createElement('p');
        desc.className = 'list-table-card-desc';
        desc.textContent = descText;
        if (descCell) moveInstrumentation(descCell, desc);
        contentBox.append(desc);
      }

      cardBody.append(contentBox);

      // Report CTA Link
      const href = getLinkHref(linkCell);
      if (href) {
        const ctaLink = document.createElement('a');
        ctaLink.className = 'list-table-cta';
        ctaLink.href = href;
        ctaLink.textContent = reportCtaTitle;
        if (linkCell) moveInstrumentation(linkCell, ctaLink);
        cardBody.append(ctaLink);
      }

      li.append(cardBody);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
