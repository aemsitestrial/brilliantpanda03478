import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea';

function moveChildren(source, destination) {
  moveInstrumentation(source, destination);
  while (source.firstChild) destination.append(source.firstChild);
}

function createFieldElement(source, className, tagName = 'div') {
  if (!source) return null;

  const element = document.createElement(tagName);
  element.className = className;
  moveChildren(source, element);
  return element;
}

function optimizeMedia(slot) {
  const image = slot.querySelector('picture > img');
  if (!image) return;

  const optimizedPicture = createOptimizedPicture(
    image.src,
    image.alt || '',
    false,
    [{ width: '1200' }],
  );
  moveInstrumentation(image, optimizedPicture.querySelector('img'));
  image.closest('picture').replaceWith(optimizedPicture);
}

function getFieldText(source) {
  return source?.textContent?.trim() || '';
}

function getLinkValue(source) {
  const authoredLink = source?.querySelector('a[href]');
  if (authoredLink) return authoredLink.getAttribute('href') || '';
  return getFieldText(source);
}

function buildHeading(source) {
  if (!source) return null;

  const existingHeading = source.querySelector('h1, h2, h3, h4, h5, h6');
  if (existingHeading) {
    existingHeading.classList.add('card-title');
    moveInstrumentation(source, existingHeading);
    return existingHeading;
  }

  const heading = document.createElement('h3');
  heading.className = 'card-title';
  moveChildren(source, heading);
  return heading;
}

function buildCta(labelCell, linkCell) {
  const href = getLinkValue(linkCell);
  const label = getFieldText(labelCell);
  if (!href || !label) return null;

  const anchor = document.createElement('a');
  anchor.className = 'card-cta-button';
  anchor.href = href;
  anchor.textContent = label;
  if (labelCell) moveInstrumentation(labelCell, anchor);
  if (linkCell) moveInstrumentation(linkCell, anchor);
  return anchor;
}

function makeCardInteractive(item, href) {
  if (!href) return;

  item.dataset.cardHref = href;
  item.tabIndex = 0;
  item.setAttribute('role', 'link');
  item.addEventListener('click', (event) => {
    if (event.target.closest(INTERACTIVE_SELECTOR)) return;
    window.location.assign(href);
  });
  item.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest(INTERACTIVE_SELECTOR)) return;
    event.preventDefault();
    window.location.assign(href);
  });
}

function buildCardItem(row) {
  const cells = [...row.children];
  if (!cells.length) return null;

  const [
    bgImageCell,
    badgeCell,
    publishDateCell,
    titleCell,
    descriptionCell,
    ctaLabelCell,
    ctaLinkCell,
  ] = cells;
  const href = getLinkValue(ctaLinkCell);

  const item = document.createElement('li');
  item.className = 'card-item';
  moveInstrumentation(row, item);
  makeCardInteractive(item, href);

  if (bgImageCell) {
    const mediaSlot = createFieldElement(bgImageCell, 'card-bg-media');
    optimizeMedia(mediaSlot);
    item.append(mediaSlot);
  }

  const contentLayer = document.createElement('div');
  contentLayer.className = 'card-content-layer';

  const headerSlot = document.createElement('div');
  headerSlot.className = 'card-header-slot';
  [
    createFieldElement(badgeCell, 'card-badge'),
    createFieldElement(publishDateCell, 'card-pub-date'),
  ].filter(Boolean).forEach((element) => headerSlot.append(element));

  const bodySlot = document.createElement('div');
  bodySlot.className = 'card-body-slot';
  [buildHeading(titleCell), createFieldElement(descriptionCell, 'card-description')]
    .filter(Boolean)
    .forEach((element) => bodySlot.append(element));

  const divider = document.createElement('div');
  divider.className = 'card-divider';
  divider.setAttribute('aria-hidden', 'true');

  const footerSlot = document.createElement('div');
  footerSlot.className = 'card-footer-slot';
  const cta = buildCta(ctaLabelCell, ctaLinkCell);
  if (cta) footerSlot.append(cta);

  contentLayer.append(headerSlot, bodySlot, divider, footerSlot);
  item.append(contentLayer);

  return item;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'card-list';

  [...block.children]
    .map((row) => buildCardItem(row))
    .filter(Boolean)
    .forEach((item) => list.append(item));

  block.replaceChildren(list);
}
