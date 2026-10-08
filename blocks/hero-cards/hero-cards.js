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
  // Extract Block Configurations
  const configuredMax = parseInt(block.dataset.maxItems, 10);
  const isValidMax = !Number.isNaN(configuredMax) && configuredMax > 0;
  const maxCards = isValidMax ? configuredMax : DEFAULT_MAX_CARDS;

  const listTitle = block.dataset.listTitle || '';
  const viewAllTitle = block.dataset.viewAllTitle || '';
  const viewAllLink = block.dataset.viewAllLink || '';
  const reportCtaTitle = block.dataset.reportCtaTitle || 'Read Report';
  const motionType = block.dataset.motionType || '';

  // Render Section Header if List Title or View All Link exists
  if (listTitle || viewAllTitle) {
    const header = document.createElement('div');
    header.className = 'hero-cards-header';

    if (listTitle) {
      const h2 = document.createElement('h2');
      h2.className = 'hero-cards-list-title';
      h2.textContent = listTitle;
      header.append(h2);
    }

    if (viewAllTitle && viewAllLink) {
      const link = document.createElement('a');
      link.className = 'hero-cards-view-all';
      link.href = viewAllLink;
      link.textContent = `${viewAllTitle} →`;
      header.append(link);
    }

    block.parentElement.insertBefore(header, block);
  }

  const ul = document.createElement('ul');

  // Filter out block meta rows and cap items by maximum (5)
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

    if (cells.length >= 5) {
      const [tagCell, titleCell, descCell, authorNameCell, authorRoleCell, linkCell] = cells;

      const cardBody = document.createElement('div');
      cardBody.className = 'hero-cards-card-body';

      const topContent = document.createElement('div');

      // Tag
      const tagText = getCellText(tagCell);
      if (tagText) {
        const tag = document.createElement('p');
        tag.className = 'hero-cards-card-tag';
        tag.textContent = tagText;
        if (tagCell) moveInstrumentation(tagCell, tag);
        topContent.append(tag);
      }

      // Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'hero-cards-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        topContent.append(title);
      }

      // Description
      const descText = getCellText(descCell);
      if (descText) {
        const desc = document.createElement('p');
        desc.className = 'hero-cards-card-desc';
        desc.textContent = descText;
        if (descCell) moveInstrumentation(descCell, desc);
        topContent.append(desc);
      }

      cardBody.append(topContent);

      // Footer: Author Details & Report CTA Title
      const footer = document.createElement('div');
      footer.className = 'hero-cards-card-footer';

      const authorName = getCellText(authorNameCell);
      const authorRole = getCellText(authorRoleCell);

      if (authorName || authorRole) {
        const authorInfo = document.createElement('div');
        authorInfo.className = 'hero-cards-author-info';

        if (authorName) {
          const nameEl = document.createElement('span');
          nameEl.className = 'hero-cards-author-name';
          nameEl.textContent = authorName;
          authorInfo.append(nameEl);
        }

        if (authorRole) {
          const roleEl = document.createElement('span');
          roleEl.className = 'hero-cards-author-role';
          roleEl.textContent = authorRole;
          authorInfo.append(roleEl);
        }

        footer.append(authorInfo);
      }

      const href = getLinkHref(linkCell);
      if (href) {
        const ctaLink = document.createElement('a');
        ctaLink.className = 'hero-cards-cta';
        ctaLink.href = href;
        ctaLink.textContent = reportCtaTitle;
        if (linkCell) moveInstrumentation(linkCell, ctaLink);
        footer.append(ctaLink);
      }

      cardBody.append(footer);
      li.append(cardBody);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
