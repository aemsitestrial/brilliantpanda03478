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
    header.className = 'card-image-header';

    if (listTitle) {
      const h2 = document.createElement('h2');
      h2.className = 'card-image-list-title';
      h2.textContent = listTitle;
      header.append(h2);
    }

    if (viewAllTitle && viewAllLink) {
      const link = document.createElement('a');
      link.className = 'card-image-view-all';
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

    if (cells.length >= 4) {
      const [imageCell, tagCell, titleCell, descCell, linkCell] = cells;

      // Top Image Wrapper
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'card-image-img-wrapper';
      const img = imageCell?.querySelector('img');
      if (img) {
        const optimizedPic = createOptimizedPicture(
          img.src,
          img.alt || 'Card Image',
          false,
          [{ width: '600' }],
        );
        imageWrapper.append(optimizedPic);
      }
      li.append(imageWrapper);

      // Card Body
      const cardBody = document.createElement('div');
      cardBody.className = 'card-image-card-body';

      const contentBox = document.createElement('div');
      contentBox.className = 'card-image-content';

      // Field 1: Tag
      const tagText = getCellText(tagCell);
      if (tagText) {
        const tag = document.createElement('p');
        tag.className = 'card-image-card-tag';
        tag.textContent = tagText;
        if (tagCell) moveInstrumentation(tagCell, tag);
        contentBox.append(tag);
      }

      // Field 2: Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const title = document.createElement('h3');
        title.className = 'card-image-card-title';
        title.textContent = titleText;
        if (titleCell) moveInstrumentation(titleCell, title);
        contentBox.append(title);
      }

      // Field 3: Description
      const descText = getCellText(descCell);
      if (descText) {
        const desc = document.createElement('p');
        desc.className = 'card-image-card-desc';
        desc.textContent = descText;
        if (descCell) moveInstrumentation(descCell, desc);
        contentBox.append(desc);
      }

      cardBody.append(contentBox);

      // Report CTA
      const href = getLinkHref(linkCell);
      if (href) {
        const footer = document.createElement('div');
        footer.className = 'card-image-card-footer';

        const ctaLink = document.createElement('a');
        ctaLink.className = 'card-image-cta';
        ctaLink.href = href;
        ctaLink.textContent = `${reportCtaTitle} →`;
        if (linkCell) moveInstrumentation(linkCell, ctaLink);

        footer.append(ctaLink);
        cardBody.append(footer);
      }

      li.append(cardBody);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
