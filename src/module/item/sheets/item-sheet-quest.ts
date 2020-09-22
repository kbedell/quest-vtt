import { QuestItem } from '../quest-item';

export class ItemSheetQuest extends ItemSheet {
  static get defaultOptions(): FormApplicationOptions {
    const options = super.defaultOptions;

    mergeObject(options, {
      width: 560,
      height: 420,
      classes: ['quest', 'sheet', 'item'],
      resizable: true
    });

    return options;
  }

  getData(): any {
    let data: ItemSheetData = super.getData();

    return data;
  }

  get template(): string {
    const path = 'systems/quest/templates/items';
    return `${path}/${this.item.data.type}.html`;
  }
}
