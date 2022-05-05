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

const textarea = document.querySelector('textarea');
textarea.focus();

function renderKeyboardTemplate() {
  renderElement('div', '.container', ['keyboard']);
  for (let i = 0; i < 5; i += 1) {
    renderElement('div', '.keyboard', ['keyboard__row', `row-${i + 1}`]);
  }
}

renderKeyboardTemplate();

let caretPosition = 0;

function getCaretPosition() {
  caretPosition = textarea.selectionStart;
}

textarea.addEventListener('click', getCaretPosition);

class Key {
  constructor(key, code, en) {
    this.key = key;
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

  addTextContent(evt) {
    const text = textarea.value;
    const textInKey = evt.target.textContent;
    const keyName = this.key;
    if (KEYS[keyName].isTextKey) {
      textarea.value = `${text}${textInKey}`;
    } else if (keyName === 'Backspace') {
      getCaretPosition();
      if (caretPosition > 0) {
        textarea.value = text.slice(0, caretPosition - 1) + text.slice(caretPosition);
        caretPosition -= 1;
        textarea.selectionStart = caretPosition;
        textarea.selectionEnd = caretPosition;
      }
    }
  }

  render(parent) {
    const element = document.createElement('button');
    element.innerHTML = this.en;
    element.classList.add('key');
    element.dataset.key = this.key;
    this.checkOptionallyClass(element);
    document.querySelector(parent).append(element);

    element.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.addTextContent(evt);
      textarea.focus();
    });
  }
}

function renderKey(key, obj, parent) {
  const { code, en } = obj;
  new Key(key, code, en).render(parent);
}

ROWS.forEach((ROW, index) => {
  ROW.forEach((key) => {
    renderKey(key, KEYS[key], `.row-${index + 1}`);
  });
});

document.addEventListener('keydown', (event) => {
  const keyName = event.code;
  const keyInDom = document.querySelector(`[data-key=${keyName}]`);
  keyInDom.classList.add('key--active');
});

document.addEventListener('keyup', (event) => {
  const keyName = event.code;
  const keyInDom = document.querySelector(`[data-key=${keyName}]`);
  keyInDom.classList.remove('key--active');
});
