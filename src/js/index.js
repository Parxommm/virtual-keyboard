import '../sass/style.scss';
import { KEYS, ROWS } from './keys';

function renderElement(tagHTML, parentSelector, classList, content) {
  const element = document.createElement(tagHTML);
  element.classList.add(...classList);
  if (content) {
    element.textContent = content;
  }
  document.querySelector(parentSelector).append(element);
}

renderElement('div', 'body', ['container']);
renderElement('h1', '.container', ['title'], 'RSS Виртуальная клавиатура');
renderElement('textarea', '.container', ['textarea']);

function renderKeyboardTemplate() {
  renderElement('div', '.container', ['keyboard']);
  for (let i = 0; i < 5; i += 1) {
    renderElement('div', '.keyboard', ['keyboard__row', `row-${i + 1}`]);
  }
}

renderKeyboardTemplate();

class Key {
  constructor(code, en) {
    this.code = code;
    this.en = en;
  }

  checkOptionallyClass(element) {
    const { code } = this;

    switch (code) {
      case 'Backspace':
        element.classList.add('key--backspace');
        break;
      case 'Tab':
        element.classList.add('key--tab');
        break;
      case 'CapsLock':
        element.classList.add('key--caps-lock');
        break;
      case 'Enter':
        element.classList.add('key--enter');
        break;
      case 'ShiftLeft':
        element.classList.add('key--shift-left');
        break;
      case 'ShiftRight':
        element.classList.add('key--shift-right');
        break;
      case 'Space':
        element.classList.add('key--space');
        break;
      default:
        break;
    }
  }

  render(parent) {
    const element = document.createElement('button');
    element.innerHTML = this.en;
    element.classList.add('key');
    this.checkOptionallyClass(element);
    document.querySelector(parent).append(element);
  }
}

function renderKey(obj, parent) {
  const { code, en } = obj;
  new Key(code, en).render(parent);
}

ROWS.forEach((ROW, index) => {
  ROW.forEach((key) => {
    renderKey(KEYS[key], `.row-${index + 1}`);
  });
});
