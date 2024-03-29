const TIMER = 120;

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerEl = document.querySelector('.timer');

const loader = document.querySelector('.loader');

const cards = Array.from(document.querySelectorAll('.card'));

const modal = document.querySelector('.modal');
const modalCloseBtn = document.querySelector('.modal__close-btn');
const modalOverlay = document.querySelector('.modal__overlay');

const checkbox = document.getElementById('agreement');
const submitBtn = document.querySelector('.tariff__btn');

function getScrollbarWidth() {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  outer.parentNode.removeChild(outer);

  return scrollbarWidth + 'px';
}

const onEscPress = (evt) => {
  const isEscKey = evt.code === 'Escape';

  if (isEscKey && modal.classList.contains('isOpen')) {
    evt.preventDefault();
    closeModal();
  }
};

const closeModal = () => {
  modal.style.overflow = 'hidden';
  modal.classList.remove('isOpen');
  window.removeEventListener('keydown', onEscPress);
  document.body.removeAttribute('style');
  modal.querySelector('.modal__wrapper').addEventListener('transitionend', () => modal.removeAttribute('style'));
}

const openModal = () => {
  modal.classList.add('isOpen');
  modal.style.overflow = 'hidden';
  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  window.addEventListener('keydown', onEscPress);
  document.body.style.paddingRight = getScrollbarWidth();
  document.body.style.overflow = 'hidden';
}

function setTimer() {
  let timer = TIMER;
  const interval = setInterval(() => {
    minutesEl.textContent = ('0' + Math.floor(timer / 60)).slice(-2);
    secondsEl.textContent = ('0' + timer % 60).slice(-2);
    timer--;
    
    document.body.removeAttribute('style');
    loader.style.display = 'none';

    if (timer < 30) {
      timerEl.classList.add('warning');
      timerEl.classList.add('animate');
    }
    if (timer < 0) {
      clearInterval(interval);
      timerEl.classList.remove('animate');
      document.querySelectorAll('.card:not(.card--alt)').forEach((card) => {
        card.classList.add('no-sale');
        setTimeout(() => {
          const priceWithDiscount = card.querySelector('.card__price-new');
          priceWithDiscount.remove();
        }, 800);
      });

      setTimeout(() => {
        openModal();
      }, 2000);
    }
  }, 1000);
}

function setData(data) {
  Array.from(data).forEach((el) => {
    cards.forEach((card) => {
      const title = card.querySelector('.card__title').textContent;
      const newPriceEl = card.querySelector('.card__price-new');
      const oldPriceEl = card.querySelector('.card__price-old');
      if (el.name.toLowerCase() === title.toLowerCase()) {
        if (!el.isPopular && !el.isDiscount) {
          oldPriceEl.textContent = el.price + '₽';
        }

        if (el.isDiscount && card.classList.contains('card--alt')) {
          newPriceEl.textContent = el.price + '₽';
        } else if (el.isPopular && !card.classList.contains('card--alt')) {
          newPriceEl.textContent = el.price + '₽';
        }
      }
    });
  });
}

async function fetchData() {
  document.body.style.overflow = 'hidden';
  try {
    const response = await fetch("https://t-pay.iqfit.app/subscribe/list-test");
    const data = await response.json();
    setData(data);
    setTimer();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    document.body.removeAttribute('style');
    loader.style.display = 'none';
  }
}

fetchData();

checkbox.addEventListener('change', () => {
  checkbox.checked ? submitBtn.disabled = false : submitBtn.disabled = true
});
