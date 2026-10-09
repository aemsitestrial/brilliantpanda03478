function getFieldElement(block, name) {
  return block.querySelector(`[data-aue-prop="${name}"]`);
}

function getTextValue(block, name, defaultValue = '') {
  const field = getFieldElement(block, name);
  return field?.textContent?.trim() || defaultValue;
}

function getHeroContent(row) {
  return {
    heroIcon: getFieldElement(row, 'heroIcon'),
    heroIconAlt: getTextValue(row, 'heroIconAlt'),
    heroImageType: getTextValue(row, 'heroImageType'),
    heroLottoImagePath: getFieldElement(row, 'heroLottoImagePath'),
    heroImageAlt: getTextValue(row, 'heroImageAlt'),
    heroView: getTextValue(row, 'heroView'),
    eyebrowText: getTextValue(row, 'eyebrowText'),
    title: getTextValue(row, 'title'),
    description: getFieldElement(row, 'description'),
    ctaTitle: getTextValue(row, 'ctaTitle'),
    ctaLinkElement: row.querySelector('.button-container a, a'),
    ctaLinkType: [...row.querySelectorAll('p')]
      .map((p) => p.textContent.trim())
      .find((text) => text === 'new-window'),
    ctaView: getTextValue(row, 'ctaView'),
  };
}

function decorateSlide(row) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide hero2';

  const content = getHeroContent(row);

  // Background Image
  if (content.heroLottoImagePath) {
    const bgImg = content.heroLottoImagePath.querySelector('img')
      || content.heroLottoImagePath;
    const bgSrc = bgImg?.getAttribute('src');

    if (content.heroImageAlt && bgImg) {
      bgImg.alt = content.heroImageAlt;
    }
    if (bgSrc) {
      slide.style.backgroundImage = `url(${bgSrc})`;
    }
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero2-content';

  // Icon
  if (content.heroIcon) {
    content.heroIcon.classList.add('hero2-icon');
    if (content.heroIconAlt) {
      content.heroIcon.alt = content.heroIconAlt;
    }
    contentWrapper.append(content.heroIcon);
  }

  // Eyebrow
  if (content.eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'hero2-eyebrow';
    eyebrow.textContent = content.eyebrowText;
    contentWrapper.append(eyebrow);
  }

  // Title
  if (content.title) {
    const title = document.createElement('h1');
    title.className = 'hero2-title';
    title.textContent = content.title;
    contentWrapper.append(title);
  }

  // Description
  if (content.description) {
    const description = document.createElement('div');
    description.className = 'hero2-description';
    description.innerHTML = content.description.innerHTML;
    contentWrapper.append(description);
  }

  // CTA Link
  if (content.ctaTitle) {
    const cta = document.createElement('a');
    cta.className = 'hero2-cta';
    cta.href = content.ctaLinkElement?.href || '#';

    if (content.ctaLinkType === 'new-window') {
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
    }

    const label = document.createElement('span');
    label.textContent = content.ctaTitle;

    const arrow = document.createElement('img');
    arrow.src = '/content/dam/2026/39/energeticowl21611/icons/arrow 14x14.svg';
    arrow.alt = '';
    arrow.className = 'hero2-cta-arrow';

    cta.append(label, arrow);
    contentWrapper.append(cta);
  }

  slide.append(contentWrapper);
  return slide;
}

export default function decorate(block) {
  const slidesTrack = document.createElement('ul');
  slidesTrack.className = 'carousel-hero-track';

  const rows = [...block.children];

  rows.forEach((row, index) => {
    const slide = decorateSlide(row);
    if (index === 0) slide.classList.add('active');
    slidesTrack.append(slide);
  });

  // Navigation Controls
  const navContainer = document.createElement('div');
  navContainer.className = 'carousel-hero-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-hero-btn prev';
  prevBtn.ariaLabel = 'Previous Slide';
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-hero-btn next';
  nextBtn.ariaLabel = 'Next Slide';
  nextBtn.innerHTML = '&#10095;';

  navContainer.append(prevBtn, nextBtn);

  let activeIndex = 0;
  const totalSlides = rows.length;

  function updateCarousel(newIndex) {
    const slides = slidesTrack.querySelectorAll('.carousel-hero-slide');
    slides[activeIndex].classList.remove('active');

    activeIndex = (newIndex + totalSlides) % totalSlides;
    slides[activeIndex].classList.add('active');

    slidesTrack.style.transform = `translateX(-${activeIndex * 100}%)`;
  }

  prevBtn.addEventListener('click', () => updateCarousel(activeIndex - 1));
  nextBtn.addEventListener('click', () => updateCarousel(activeIndex + 1));

  block.textContent = '';
  block.append(slidesTrack, navContainer);
}
