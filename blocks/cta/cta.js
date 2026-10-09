const DEFAULTS = {
  text_cta: '',
  ctaLink: '',
  linkTarget: 'default',
  ariaLabel: '',
  shape: 'rectangle',
  backgroundColor: '',
  textColor: '',
  borderColor: '',
  arrowDirection: 'none',
};

const ALLOWED_SHAPES = [
  'rectangle',
  'rounded',
  'pill',
];

const ALLOWED_LINK_TARGETS = [
  'default',
  'new-window',
];

function normalizeLinkTarget(value) {
  if (String(value).trim().toLowerCase() === 'true') {
    return 'new-window';
  }

  if (ALLOWED_LINK_TARGETS.includes(value)) {
    return value;
  }

  return DEFAULTS.linkTarget;
}

const ALLOWED_ARROWS = [
  'none',
  'left',
  'right',
];

function getFieldValue(block, index, fallback = '') {
  const field = block.children[index];

  if (!field) {
    return fallback;
  }

  return field.textContent.trim() || fallback;
}

function normalizeShape(value) {
  if (ALLOWED_SHAPES.includes(value)) {
    return value;
  }

  return DEFAULTS.shape;
}

function normalizeArrow(value) {
  if (ALLOWED_ARROWS.includes(value)) {
    return value;
  }

  return DEFAULTS.arrowDirection;
}

function isValidCssColor(value) {
  if (!value) {
    return false;
  }

  const element = document.createElement('span');

  element.style.color = value;

  return Boolean(element.style.color);
}

function createArrow(direction) {
  const wrapper = document.createElement('span');

  wrapper.className = `cta-arrow cta-arrow-${direction}`;
  wrapper.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );

  svg.classList.add('cta-arrow-icon');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '1em');
  svg.setAttribute('height', '1em');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  );

  if (direction === 'left') {
    path.setAttribute(
      'd',
      'M19 12H5M12 19l-7-7 7-7',
    );
  } else {
    path.setAttribute(
      'd',
      'M5 12h14M12 5l7 7-7 7',
    );
  }

  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  wrapper.appendChild(svg);

  return wrapper;
}

function readBlockContent(block) {
  return {
    text_cta: getFieldValue(
      block,
      0,
      DEFAULTS.text_cta,
    ),

    ctaLink: getFieldValue(
      block,
      1,
      DEFAULTS.ctaLink,
    ),

    linkTarget: normalizeLinkTarget(
      [...block.children]
        .map((cell) => cell.textContent.trim().toLowerCase())
        .find((text) => text === 'new-window' || text === 'true')
        || DEFAULTS.linkTarget,
    ),

    ctaView: getFieldValue(
      block,
      3,
      'default',
    ),

    ariaLabel: getFieldValue(
      block,
      4,
      DEFAULTS.ariaLabel,
    ),

    shape: normalizeShape(
      getFieldValue(
        block,
        5,
        DEFAULTS.shape,
      ),
    ),

    backgroundColor: getFieldValue(
      block,
      6,
      DEFAULTS.backgroundColor,
    ),

    textColor: getFieldValue(
      block,
      7,
      DEFAULTS.textColor,
    ),

    borderColor: getFieldValue(
      block,
      8,
      DEFAULTS.borderColor,
    ),

    arrowDirection: normalizeArrow(
      getFieldValue(
        block,
        9,
        DEFAULTS.arrowDirection,
      ),
    ),
  };
}

function createCta(data) {
  console.log('linkTarget:', data.linkTarget);
  console.log('CTA data:', data);
  if (!data.text_cta || !data.ctaLink) {
    return null;
  }

  const link = document.createElement('a');

  link.className = [
    'cta-link',
    `cta-link-${data.shape}`,
  ].join(' ');

  link.href = data.ctaLink;

  link.setAttribute(
    'aria-label',
    data.ariaLabel || data.text_cta,
  );

  const normalizedTarget = String(data.linkTarget || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  const opensNewTab = [
    '_blank',
    'blank',
    'new-tab',
    'new-window',
  ].includes(normalizedTarget);

  if (opensNewTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  console.log('opensNewTab:', opensNewTab);
  console.log('target:', link.target);

  if (isValidCssColor(data.backgroundColor)) {
    link.style.backgroundColor = data.backgroundColor;
  }

  if (isValidCssColor(data.textColor)) {
    link.style.color = data.textColor;
  }

  if (isValidCssColor(data.borderColor)) {
    link.style.borderColor = data.borderColor;
  }

  if (data.arrowDirection === 'left') {
    link.appendChild(
      createArrow('left'),
    );
  }

  const text = document.createElement('span');

  text.className = 'cta-text';
  text.textContent = data.text_cta;

  link.appendChild(text);

  if (data.arrowDirection === 'right') {
    link.appendChild(
      createArrow('right'),
    );
  }

  return link;
}

export default function decorate(block) {
  const data = readBlockContent(block);
  const cta = createCta(data);

  block.replaceChildren();

  if (cta) {
    block.appendChild(cta);
  }
}
