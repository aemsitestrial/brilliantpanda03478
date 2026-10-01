import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function renderImageCell(cell, className) {
  const picture = cell?.querySelector('picture');
  if (!picture) return null;

  const img = picture.querySelector('img');
  if (!img) return null;

  const optimizedPic = createOptimizedPicture(img.src, img.alt || 'Card Image', false, [{ width: '750' }]);
  moveInstrumentation(img, optimizedPic.querySelector('img'));
  picture.replaceWith(optimizedPic);

  const wrapper = document.createElement('div');
  wrapper.className = className;
  wrapper.append(optimizedPic);
  return wrapper;
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
      // Destructure 4 cells to satisfy ESLint prefer-destructuring rule
      const [imageCell, themeCell, metaCell, contentCell] = cells;

      // Extract theme value
      const themeValue = themeCell?.textContent?.trim()?.toLowerCase() || 'default-light';
      li.classList.add(`theme-${themeValue}`);

      // 1. Image Banner (Skipped for blue-solid theme)
      if (imageCell && imageCell.querySelector('picture') && themeValue !== 'blue-solid') {
        const imageWrapper = renderImageCell(imageCell, 'card-image-banner');
        if (imageWrapper) li.append(imageWrapper);
      }

      // 2. Card Body Wrapper
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // 3. Metadata Bar Parsing
      if (metaCell && metaCell.textContent.trim()) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'card-meta-bar';
        moveInstrumentation(metaCell, metaDiv);

        const metaText = metaCell.textContent.trim();
        const parts = metaText.split(/[|,]/).map((p) => p.trim());

        if (parts.length > 1) {
          const [catText, tagText, topicText, pubDateText] = parts;

          const tagsWrapper = document.createElement('div');
          tagsWrapper.className = 'meta-tags-wrapper';

          if (catText) {
            const catSpan = document.createElement('span');
            catSpan.className = 'meta-category-badge';
            catSpan.textContent = catText;
            tagsWrapper.append(catSpan);
          }

          const tagSpan = document.createElement('span');
          tagSpan.className = 'meta-tag-label';
          tagSpan.textContent = tagText || 'TAG';
          tagsWrapper.append(tagSpan);

          if (topicText) {
            const topicSpan = document.createElement('span');
            topicSpan.className = 'meta-topic-text';
            topicSpan.textContent = topicText;
            tagsWrapper.append(topicSpan);
          }

          metaDiv.append(tagsWrapper);

          if (pubDateText) {
            const pubDateDiv = document.createElement('div');
            pubDateDiv.className = 'meta-pubdate-text';
            pubDateDiv.textContent = pubDateText;
            metaDiv.append(pubDateDiv);
          }
        } else {
          metaDiv.innerHTML = metaCell.innerHTML;
        }

        cardBody.append(metaDiv);
      }

      // 4. Content (Title, Description, Stats & CTA Link)
      if (contentCell && contentCell.childNodes.length > 0) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-main-content';
        moveInstrumentation(contentCell, contentDiv);

        contentDiv.querySelectorAll('a').forEach((a) => {
          a.classList.add('card-button-action');
        });

        contentDiv.append(...contentCell.childNodes);
        cardBody.append(contentDiv);
      }

      li.append(cardBody);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
