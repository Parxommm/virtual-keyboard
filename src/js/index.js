import '../sass/style.scss';
import { KEYS, ROWS } from './keys';

function renderElement(tagHTML, parentSelector, classList, content) {
  const element = document.createElement(tagHTML);
  element.classList.add(...classList);
  if (content) {
    element.textContent = content;
  }
  if (tagHTML === 'textarea') {
    element.wrap = 'hard';
    element.cols = 10;
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

  changeTextContent(evt) {
    const text = textarea.value;
    const textInKey = evt.target.textContent;
    const keyName = this.key;
    const { cols } = textarea;
    getCaretPosition();
    if (KEYS[keyName].isTextKey) {
      textarea.value = text.slice(0, caretPosition) + textInKey + text.slice(caretPosition);
      textarea.selectionStart = caretPosition + 1;
      textarea.selectionEnd = caretPosition + 1;
    } else if (keyName === 'Backspace') {
      if (caretPosition > 0) {
        textarea.value = text.slice(0, caretPosition - 1) + text.slice(caretPosition);
        caretPosition -= 1;
        textarea.selectionStart = caretPosition;
        textarea.selectionEnd = caretPosition;
      }
    } else if (keyName === 'Delete') {
      if (caretPosition < text.length) {
        textarea.value = text.slice(0, caretPosition) + text.slice(caretPosition + 1);
        textarea.selectionStart = caretPosition;
        textarea.selectionEnd = caretPosition;
      }
    } else if (keyName === 'ArrowLeft') {
      if (caretPosition > 0) {
        textarea.selectionStart = caretPosition - 1;
        textarea.selectionEnd = caretPosition - 1;
      }
    } else if (keyName === 'ArrowRight') {
      if (caretPosition < text.length) {
        textarea.selectionStart = caretPosition + 1;
        textarea.selectionEnd = caretPosition + 1;
      }
    } else if (keyName === 'ArrowUp') {
      if (caretPosition >= cols) {
        textarea.selectionStart = caretPosition - cols;
        textarea.selectionEnd = caretPosition - cols;
      } else {
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
      }
    } else if (keyName === 'ArrowDown') {
      if (caretPosition <= text.length - cols) {
        textarea.selectionStart = caretPosition + cols;
        textarea.selectionEnd = caretPosition + cols;
      } else {
        textarea.selectionStart = text.length;
        textarea.selectionEnd = text.length;
      }
    }
    getCaretPosition();
    console.log(caretPosition);
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
      this.changeTextContent(evt);
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
