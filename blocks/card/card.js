import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const LAYOUT_VARIANTS = new Set([
  'vertical',
  'horizontal-left',
  'horizontal-right',
  'overlay',
  'text-only',
]);

function normalizeLayoutVariant(value) {
  const normalizedValue = value?.trim()?.toLowerCase();
  return LAYOUT_VARIANTS.has(normalizedValue) ? normalizedValue : 'vertical';
}

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

function buildCardItem(row) {
  const cells = [...row.children];
  if (!cells.length) return null;

  const [mediaCell, tagCell, titleCell, bodyCell, ctaCell, variantCell] = cells;
  const layoutVariant = normalizeLayoutVariant(
    variantCell?.textContent || row.dataset.layoutVariant,
  );

  const item = document.createElement('li');
  item.className = `card-item layout-${layoutVariant}`;
  item.dataset.layoutVariant = layoutVariant;
  moveInstrumentation(row, item);

  if (mediaCell && layoutVariant !== 'text-only') {
    const mediaSlot = createFieldElement(mediaCell, 'card-media-slot');
    optimizeMedia(mediaSlot);
    item.append(mediaSlot);
  }

  const bodySlot = document.createElement('div');
  bodySlot.className = 'card-body-slot';

  const contentSlot = document.createElement('div');
  contentSlot.className = 'card-content-slot';

  [
    createFieldElement(tagCell, 'card-tag'),
    createFieldElement(titleCell, 'card-title'),
    createFieldElement(bodyCell, 'card-copy'),
  ].filter(Boolean).forEach((element) => contentSlot.append(element));

  bodySlot.append(contentSlot);

  const actionsSlot = createFieldElement(ctaCell, 'card-actions');
  if (actionsSlot) bodySlot.append(actionsSlot);

  item.append(bodySlot);

  if (variantCell) {
    const metadataSlot = createFieldElement(variantCell, 'card-layout-metadata');
    item.append(metadataSlot);
  }

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
