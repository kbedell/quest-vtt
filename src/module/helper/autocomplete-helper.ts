import { getItemByName } from './item-helpers';

export async function autocomplete(options: any) {
  const input: HTMLInputElement = options.input as HTMLInputElement,
    autocomplete: HTMLElement = options.autocomplete as HTMLElement,
    object = options.object,
    data = options.data,
    handlers: { [index: string]: Function } = {
      tab: function (e: JQuery.KeyPressEvent) {
        e.preventDefault();
        let suggestion = getSuggestion(input.value);
        input.value = suggestion;
      },
      input: function (e: any) {
        autocomplete.innerHTML = input.value;
        let suggestion = getSuggestion(input.value);
        autocomplete.innerHTML += suggestion.slice(autocomplete.innerHTML.length, suggestion.length);
      },
      enter: async function (e: any) {
        const value = input.value;
        const updateData = duplicate(object.data);

        if (options.type === 'ability' && value) {
          let item = await getItemByName(value, 'ability');

          updateData.data.abilities.push(item._id);
        } else if (options.type === 'path' && value) {
          let item = await getItemByName(value, 'path');

          updateData.data.paths.push(item._id);
        } else if (options.type === 'legendary' && value) {
          let item = await getItemByName(value, 'ability');

          updateData.data.legendaries.push(item._id);
        } else if (options.type === 'gear' && value) {
          let item = await getItemByName(value, 'gear');

          updateData.data.gear.push(item._id);
        }

        object.update(updateData);

        input.value = '';
        autocomplete.innerHTML = '';
      }
    };

  function getSuggestion(text: string): string {
    let search = text.toLowerCase();

    let regex = new RegExp('^' + search + '.*', 'i');

    for (let d = 0; d < data.length; d++) {
      if (regex.test(data[d].name.toLowerCase())) {
        return data[d].name;
      }
    }

    return '';
  }

  function keyHandler(event: any) {
    let key = event.keyCode;
    let method =
      key === 13
        ? 'enter'
        : key === 9
        ? 'tab'
        : event.type === 'input'
        ? 'input'
        : event.type === 'keyup'
        ? 'input'
        : null;

    return method ? handlers[method](event) : clear(event);
  }

  function clear(event: any) {
    if ((input.value.length <= 1 && event.keyCode === 8) || input.value === '') {
      autocomplete.innerHTML = '';
    }
  }

  input.addEventListener('keyup', keyHandler);
  input.addEventListener('keydown', keyHandler);
}
