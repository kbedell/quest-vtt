export function ShowCloseSelector(event: JQuery.ClickEvent) {
  event.preventDefault();
  event.stopPropagation();
  closeSelector(event.target);
  event.target.nextElementSibling.classList.toggle('hide');
  event.target.classList.toggle('select-arrow-active');
}

function closeSelector(selector: HTMLElement) {
  const items = document.getElementsByClassName('select-items');
  const selectors = document.getElementsByClassName('quest-selector');
  let hider = [];

  for (let s = 0; s < selectors.length; s++) {
    if (selector === selectors[s]) {
      hider.push(s);
    } else {
      selectors[s].classList.remove('select-arrow-active');
    }
  }

  for (let i = 0; i < items.length; i++) {
    if (hider.indexOf(i)) {
      items[i].classList.add('hide');
    }
  }
}

export function UpdateSelector(event: JQuery.ClickEvent) {
  event.preventDefault();
  const selector = event.target.parentNode.parentNode.getElementsByTagName('select')[0];
  const selectorDisplay = event.target.parentNode.parentNode.getElementsByClassName('selector-selected')[0];

  for (let s = 0; s < selector.length; s++) {
    if (selector.options[s].innerHTML.trim() === event.target.innerHTML) {
      selector[s].setAttribute('selected', true);
      selectorDisplay.innerHTML = event.target.innerHTML;
      const selected = event.target.parentNode.getElementsByClassName('same-as-selected');
      for (let sl = 0; sl < selected.length; sl++) {
        selected[sl].removeAttribute('class');
      }
      event.target.setAttribute('class', 'same-as-selected');
      break;
    } else {
      selector[s].removeAttribute('selected');
    }
  }

  closeSelector(selector);
}

export function CloseSelector(event: JQuery.ClickEvent) {
  const items = document.getElementsByClassName('selector-items');
  for (let i = 0; i < items.length; i++) {
    if (!items[i].classList.contains('hide')) {
      items[i].classList.add('hide');
    }
  }
}
