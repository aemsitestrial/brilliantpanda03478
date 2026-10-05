export default function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = Number.isNaN(slideIndex) ? 0 : slideIndex;
  realSlideIndex = realSlideIndex < 0 ? slides.length - 1 : realSlideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];
  if (!activeSlide) return;

  activeSlide
    .querySelectorAll('a')
    .forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}
