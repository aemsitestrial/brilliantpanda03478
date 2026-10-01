import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function getCellText(cell) {
  if (!cell) return '';
  return cell.querySelector('p, div, a, span')?.textContent?.trim() || cell.textContent?.trim() || '';
}

function renderImageCell(cell, className) {
  const picture = cell?.querySelector('picture');
  if (!picture) return null;

  const img = picture.querySelector('img');
  if (!img) return null;

  const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  moveInstrumentation(img, optimizedPic.querySelector('img'));
  picture.replaceWith(optimizedPic);

  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(optimizedPic);
  return wrapper;
}

function getLinkCell(buttonLinkCell) {
  if (!buttonLinkCell) return null;
  return buttonLinkCell.querySelector('a');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'content-cards-grid';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'content-card-item';

    moveInstrumentation(row, li);

    const cells = [...row.children];
    if (cells.length > 0) {
      // Cell mappings based on content-card-item model fields order
      const imageCell = cells[0] || null;
      const themeCell = cells[1] || null;
      const categoryCell = cells[2] || null;
      const topicCell = cells[3] || null;
      const publishedDateCell = cells[4] || null;
      const titleCell = cells[5] || null;
      const descriptionCell = cells[6] || null;
      const statsCell = cells[7] || null;
      const buttonLinkCell = cells[8] || null;

      // Extract child theme choice
      const themeValue = getCellText(themeCell)?.toLowerCase() || 'default-light';
      li.classList.add(`theme-${themeValue}`);

      // 1. Image Banner
      if (imageCell && imageCell.querySelector('picture') && themeValue !== 'blue-solid') {
        const imageWrapper = renderImageCell(imageCell, 'card-image-banner');
        if (imageWrapper) li.append(imageWrapper);
      }

      // 2. Card Body Wrapper
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // 3. Metadata Header Bar
      const category = getCellText(categoryCell);
      const topic = getCellText(topicCell);
      const pubDate = getCellText(publishedDateCell);

      if (category || topic || pubDate) {
        const metaContainer = document.createElement('div');
        metaContainer.className = 'card-meta-bar';

        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'meta-tags-wrapper';

        if (category) {
          const catSpan = document.createElement('span');
          catSpan.className = 'meta-category-badge';
          catSpan.textContent = category;
          moveInstrumentation(categoryCell, catSpan);
          tagsWrapper.append(catSpan);
        }

        const tagSpan = document.createElement('span');
        tagSpan.className = 'meta-tag-label';
        tagSpan.textContent = 'TAG';
        tagsWrapper.append(tagSpan);

        if (topic) {
          const topicSpan = document.createElement('span');
          topicSpan.className = 'meta-topic-text';
          topicSpan.textContent = topic;
          moveInstrumentation(topicCell, topicSpan);
          tagsWrapper.append(topicSpan);
        }

        metaContainer.append(tagsWrapper);

        if (pubDate) {
          const pubDateDiv = document.createElement('div');
          pubDateDiv.className = 'meta-pubdate-text';
          pubDateDiv.textContent = pubDate;
          moveInstrumentation(publishedDateCell, pubDateDiv);
          metaContainer.append(pubDateDiv);
        }

        cardBody.append(metaContainer);
      }

      // 4. Headline Title
      const titleText = getCellText(titleCell);
      if (titleText) {
        const h3 = document.createElement('h3');
        h3.className = 'card-headline';
        h3.textContent = titleText;
        moveInstrumentation(titleCell, h3);
        cardBody.append(h3);
      }

      // 5. Description Body
      if (descriptionCell && descriptionCell.childNodes.length > 0) {
        const descDiv = document.createElement('div');
        descDiv.className = 'card-description-body';
        moveInstrumentation(descriptionCell, descDiv);
        descDiv.append(...descriptionCell.childNodes);
        cardBody.append(descDiv);
      }

      // 6. Action Button / Link
      const link = getLinkCell(buttonLinkCell);
      if (link) {
        link.className = 'card-button-action';
        moveInstrumentation(buttonLinkCell, link);
        cardBody.append(link);
      }

      // 7. Stats / Author Info
      if (statsCell && statsCell.childNodes.length > 0) {
        const authorDiv = document.createElement('div');
        authorDiv.className = 'card-author-footer';
        moveInstrumentation(statsCell, authorDiv);
        authorDiv.append(...statsCell.childNodes);
        cardBody.append(authorDiv);
      }

      li.append(cardBody);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
