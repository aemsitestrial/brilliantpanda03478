import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'card-component-grid';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card-item';

    moveInstrumentation(row, li);

    const cells = [...row.children];
    if (cells.length > 0) {
      const [titleEl, descriptionCell, statsCell, linkCell] = cells;
      const fullText = titleEl?.textContent?.trim() || '';
      const textParts = fullText.split(/\r?\n+/).map((p) => p.trim()).filter(Boolean);
      const [categoryText, ...titleParts] = textParts;

      const topContent = document.createElement('div');
      topContent.className = 'card-content-top';
      if (titleEl) {
        moveInstrumentation(titleEl, topContent);
      }

      if (textParts.length > 1) {
        const category = document.createElement('div');
        category.className = 'card-category';
        category.textContent = categoryText;
        topContent.append(category);

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = titleParts.join(' ');
        topContent.append(title);
      } else if (textParts.length === 1) {
        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = categoryText;
        topContent.append(title);
      }

      if (descriptionCell) {
        const desc = document.createElement('div');
        desc.className = 'card-description';
        moveInstrumentation(descriptionCell, desc);
        desc.append(...descriptionCell.childNodes);
        topContent.append(desc);
      }

      const bottomContent = document.createElement('div');
      bottomContent.className = 'card-content-bottom';

      if (statsCell) {
        const stats = document.createElement('div');
        stats.className = 'card-stats';
        moveInstrumentation(statsCell, stats);
        stats.append(...statsCell.childNodes);
        bottomContent.append(stats);
      }

      if (linkCell) {
        const link = linkCell.querySelector('a');
        if (link) {
          moveInstrumentation(linkCell, link);
          link.className = 'card-button';
          bottomContent.append(link);
        }
      }

      li.append(topContent, bottomContent);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
