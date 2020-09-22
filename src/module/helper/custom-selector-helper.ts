export function ShowCloseSelector(event: JQuery.ClickEvent) {
  event.preventDefault();
  event.stopPropagation();
  closeSelector(event.target);
  event.target.nextSibling.classList.toggle('hide');
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
  const selector = event.target.parentNode.getElementsByTagName('select')[0];
  const previousSibling = event.target.parentNode.previousSibling;

  for (let s = 0; s < selector.length; s++) {
    if (selector.options[s].innerHTML === event.target.innerHTML) {
      selector[s].selectedIndex = s;
      previousSibling.innerHTML = event.target.innerHTML;

      const selected = event.target.parentNode.getElementsByClassName('same-as-selected');
      for (let sl = 0; sl < selected.length; sl++) {
        selected[sl].removeAttribute('class');
      }
      event.target.setAttribute('class', 'same-as-selected');
      break;
    }
  }
}
