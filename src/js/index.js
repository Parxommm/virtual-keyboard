import '../sass/style.scss';
import { KEYS, ROWS, NAV_KEYS } from './keys';

let currentLang = 'en';
if (localStorage.getItem('lang')) {
  currentLang = localStorage.getItem('lang');
}
let isCapsLock = false;

function renderElement(tagHTML, parentSelector, classList, content) {
  const element = document.createElement(tagHTML);
  element.classList.add(...classList);
  if (content) {
    element.innerHTML = content;
  }
  if (tagHTML === 'textarea') {
    element.wrap = 'hard';
    element.cols = 60;
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

function changeCaretPosition(value) {
  const text = textarea.value;
  const { cols } = textarea;

  switch (value) {
    case 'next':
      textarea.selectionStart = caretPosition + 1;
      textarea.selectionEnd = caretPosition + 1;
      break;
    case 'prev':
      textarea.selectionStart = caretPosition - 1;
      textarea.selectionEnd = caretPosition - 1;
      break;
    case 'normal':
      textarea.selectionStart = caretPosition;
      textarea.selectionEnd = caretPosition;
      break;
    case 'start':
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
      break;
    case 'end':
      textarea.selectionStart = text.length;
      textarea.selectionEnd = text.length;
      break;
    case 'up':
      textarea.selectionStart = caretPosition - cols;
      textarea.selectionEnd = caretPosition - cols;
      break;
    case 'down':
      textarea.selectionStart = caretPosition + cols;
      textarea.selectionEnd = caretPosition + cols;
      break;
    default:
      break;
  }
}

function getTextKeys() {
  return document.querySelectorAll('[data-is-text="true"]');
}

function changeTextInKeys(lang) {
  const textKeys = getTextKeys();
  textKeys.forEach((elem) => {
    const textKey = elem;
    const textKeyName = textKey.dataset.key;
    textKey.innerHTML = KEYS[textKeyName][lang];
  });
}

function keysToUpperCase(value) {
  const textKeys = getTextKeys();
  textKeys.forEach((elem) => {
    const textKey = elem;
    const text = textKey.textContent;
    if (value) {
      textKey.innerHTML = text.toUpperCase();
    } else {
      textKey.innerHTML = text.toLowerCase();
    }
  });
}

function changeTextOnShift(value) {
  if (value === 'on') {
    if (currentLang === 'en') {
      changeTextInKeys('shiftEn');
    } else {
      changeTextInKeys('shiftRu');
    }
  } else if (value === 'off') {
    if (currentLang === 'en') {
      changeTextInKeys('en');
    } else {
      changeTextInKeys('ru');
    }
  }
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

  checkTextKey(element) {
    const { key } = this;
    if (KEYS[key].isTextKey) {
      // eslint-disable-next-line no-param-reassign
      element.dataset.isText = true;
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
      changeCaretPosition('next');
    } else if (keyName === 'Backspace') {
      if (caretPosition > 0) {
        textarea.value = text.slice(0, caretPosition - 1) + text.slice(caretPosition);
        changeCaretPosition('prev');
      }
    } else if (keyName === 'Delete') {
      if (caretPosition < text.length) {
        textarea.value = text.slice(0, caretPosition) + text.slice(caretPosition + 1);
        changeCaretPosition('normal');
      }
    } else if (keyName === 'ArrowLeft') {
      if (caretPosition > 0) {
        changeCaretPosition('prev');
      }
    } else if (keyName === 'ArrowRight') {
      if (caretPosition < text.length) {
        changeCaretPosition('next');
      }
    } else if (keyName === 'ArrowUp') {
      if (caretPosition >= cols) {
        changeCaretPosition('up');
      } else {
        changeCaretPosition('start');
      }
    } else if (keyName === 'ArrowDown') {
      if (caretPosition <= text.length - cols) {
        changeCaretPosition('down');
      } else {
        changeCaretPosition('end');
      }
    } else if (keyName === 'Tab') {
      const tab = '\t';
      textarea.value = text.slice(0, caretPosition) + tab + text.slice(caretPosition);
      changeCaretPosition('next');
    } else if (keyName === 'Enter') {
      const tab = '\n';
      textarea.value = text.slice(0, caretPosition) + tab + text.slice(caretPosition);
      changeCaretPosition('next');
    }
  }

  addClickEvent(element) {
    const keyName = element.dataset.key;
    if (KEYS[keyName].isTextKey || NAV_KEYS.includes(keyName)) {
      const changeText = (evt) => {
        this.changeTextContent(evt);
        textarea.focus();
      };
      let isPressed = false;
      element.addEventListener('mousedown', (evt) => {
        element.classList.add('key--active');
        isPressed = true;
        const timerId = setInterval(() => {
          changeText(evt);
          if (isPressed === false) {
            clearInterval(timerId);
          }
        }, 100);
      });
      element.addEventListener('mouseup', () => {
        element.classList.remove('key--active');
        isPressed = false;
      });
    } else if (keyName === 'ShiftLeft' || keyName === 'ShiftRight') {
      element.addEventListener('mousedown', () => {
        changeTextOnShift('on');
      });
      element.addEventListener('mouseup', () => {
        changeTextOnShift('off');
      });
    } else if (keyName === 'CapsLock') {
      element.addEventListener('click', (evt) => {
        if (!isCapsLock) {
          keysToUpperCase(true);
          evt.target.classList.add('key--active');
          isCapsLock = true;
        } else {
          keysToUpperCase(false);
          evt.target.classList.remove('key--active');
          isCapsLock = false;
        }
      });
    }
  }

  render(parent) {
    const element = document.createElement('button');
    element.innerHTML = this.en;
    element.classList.add('key');
    element.dataset.key = this.key;
    this.checkOptionallyClass(element);
    this.checkTextKey(element);
    document.querySelector(parent).append(element);
    this.addClickEvent(element);
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

renderElement('span', '.container', ['info'], 'Клавиатура создана в операционной системе Windows.<br>Для переключения языка комбинация: левыe ctrl + alt');

document.addEventListener('keydown', (event) => {
  const keyName = event.code;
  const keyInDom = document.querySelector(`[data-key=${keyName}]`);
  keyInDom.classList.add('key--active');
  if (event.key === 'Tab') {
    const tab = '\t';
    const text = textarea.value;
    event.preventDefault();
    getCaretPosition();
    textarea.value = text.slice(0, caretPosition) + tab + text.slice(caretPosition);
    changeCaretPosition('next');
  } else if (event.key === 'Shift') {
    isCapsLock = true;
    changeTextOnShift('on');
  } else if (event.key === 'CapsLock') {
    if (isCapsLock === false) {
      isCapsLock = true;
      keysToUpperCase(true);
      keyInDom.classList.add('key--active');
    } else {
      isCapsLock = false;
      keysToUpperCase(false);
      keyInDom.classList.remove('key--active');
    }
  } else if (KEYS[keyName].isTextKey) {
    event.preventDefault();
    const text = textarea.value;
    let textInKey = KEYS[keyName][currentLang];
    if (isCapsLock) {
      textInKey = textInKey.toUpperCase();
    }
    getCaretPosition();
    textarea.value = text.slice(0, caretPosition) + textInKey + text.slice(caretPosition);
    changeCaretPosition('next');
  }
});

document.addEventListener('keyup', (event) => {
  const keyName = event.code;
  const keyInDom = document.querySelector(`[data-key=${keyName}]`);
  if (keyName !== 'CapsLock') {
    keyInDom.classList.remove('key--active');
  }
  if (event.key === 'Shift') {
    isCapsLock = false;
    changeTextOnShift('off');
  }
});

function runOnKeys(func, ...codes) {
  const pressed = new Set();
  document.addEventListener('keydown', (event) => {
    pressed.add(event.code);
    for (let i = 0; i < codes.length; i += 1) {
      if (!pressed.has(codes[i])) {
        return;
      }
    }
    pressed.clear();
    func();
  });

  document.addEventListener('keyup', (event) => {
    pressed.delete(event.code);
  });
}

function changeLang() {
  if (currentLang === 'en') {
    changeTextInKeys('ru');
    currentLang = 'ru';
  } else {
    changeTextInKeys('en');
    currentLang = 'en';
  }

  localStorage.setItem('lang', currentLang);
}

runOnKeys(changeLang, 'ControlLeft', 'AltLeft');

changeTextInKeys(currentLang);
