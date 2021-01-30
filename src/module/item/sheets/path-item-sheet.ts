import { ItemSheetQuest } from './item-sheet-quest';
import { getItem, getAllItems, getItemByName } from '../../helper/item-helpers';
import { autocomplete } from '../../helper/autocomplete-helper';
import { AbilityItem } from '../ability-item';

export class PathItemSheet extends ItemSheetQuest {
  static get defaultOptions(): FormApplicationOptions {
    const options = super.defaultOptions;

    mergeObject(options, {
      width: 450,
      height: 500,
      classes: ['quest', 'sheet', 'item', 'path'],
      resizable: true
    });

    return options;
  }

  async getData(): Promise<PathSheetData> {
    let data = super.getData() as PathSheetData;

    data.abilities = await this._getAbilities(data.data.abilities);

    return data;
  }

  async activateListeners(html: JQuery): Promise<void> {
    super.activateListeners(html);

    if (!this.options.editable) return;

    const data = await getAllItems('ability', false);
    let options = {
      data: data,
      input: document.getElementById('filter'),
      autocomplete: document.getElementById('autocomplete'),
      button: document.getElementById('adder-ability'),
      type: 'ability',
      object: this.object
    };

    await autocomplete(options);

    html.find('.delete-ability').on('click', this._onDeleteAbility.bind(this));
    html.find('li.ability').each((i, li) => {
      li.setAttribute('draggable', 'true');
      li.addEventListener('dragstart', this._onReorderDragStart.bind(this), false);
      li.addEventListener('dragover', this._onReorderDragOver.bind(this), false);
      li.addEventListener('dragenter', this._onReorderDragEnter.bind(this), false);
      li.addEventListener('dragleave', this._onReorderDragLeave.bind(this), false);
      li.addEventListener('dragend', this._onReorderDragEnd.bind(this), false);
    });
  }

  async _getAbilities(abilities: Array<string> | undefined): Promise<Array<AbilityItem>> {
    let fullAbilities: Array<AbilityItem> = [];
    if (abilities) {
      for (let a = 0; a < abilities.length; a++) {
        fullAbilities.push(await getItem(abilities[a], 'ability'));
      }
    }

    return fullAbilities;
  }

  _onDeleteAbility(event: JQuery.ClickEvent) {
    event.preventDefault();
    const index = Number(event.currentTarget.closest('.ability').dataset.index);
    const updateData = duplicate(this.item.data);
    updateData.data.abilities.splice(index, 1);

    this.item.update(updateData, {});
  }

  _onReorderDragStart(event: any) {
    event.currentTarget.classList.add('dragging');
  }

  async _onReorderDragEnd(event: any) {
    let draggables = document.querySelectorAll('.ability');
    let newOrder: Array<string> = [];

    for (let d = 0; d < draggables.length; d++) {
      let draggable = draggables[d] as HTMLElement;
      draggable.classList.remove('dragging');
      let id = draggable.dataset.id as string;
      newOrder.push(id);
    }

    let updateData = duplicate(this.item.data);
    updateData.data.abilities = newOrder;

    await this.item.update(updateData, {});
    this.render(true);
    return false;
  }

  _onReorderDragOver(event: any) {
    event.preventDefault();

    let containers = document.querySelectorAll('.abilities-list');

    for (let c = 0; c < containers.length; c++) {
      const afterElement = this._getDragAfterElement(containers[c] as HTMLElement, event.clientY as number);
      const draggable = document.querySelector('.dragging') as HTMLElement;
      if (afterElement === null) {
        containers[c].appendChild(draggable);
      } else {
        containers[c].insertBefore(draggable, afterElement);
      }
    }
    return false;
  }

  _onReorderDragEnter(event: any) {
    event.preventDefault();
    return false;
  }

  _onReorderDragLeave(event: any) {
    event.preventDefault();
    return false;
  }

  async _reorderAbilities(event: any) {
    let list = document.getElementById('abilities-list');
    let newOrder = [];
    let updateData = duplicate(this.item.data);

    if (list) {
      for (let i = 0; i < list.children.length; i++) {
        let child = list.children[i] as HTMLElement;
        let item = child.dataset.itemId;

        for (let h = 0; h < updateData.data.abilities.length; h++) {
          if (updateData.data.abilities[h].id === item) {
            newOrder.push(updateData.data.abilities[h]);
          }
        }
      }

      updateData.data.abilities = newOrder;
      await this.item.update(updateData, {});
      this.render(true);
    }
    return false;
  }

  _getDragAfterElement(container: HTMLElement, y: number) {
    const draggableElements: Array<any> = Array.from(container.querySelectorAll('.ability:not(.dragging)'));

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
}

interface PathSheetData extends ItemSheetData {
  abilities: Array<AbilityItem>;
}
