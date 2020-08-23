/**
 * Override and extend the core ItemSheet implementation to handle Quest specific item types
 * @type {ItemSheet}
 */
export class ItemSheetQuest extends ItemSheet {
  constructor(...args) {
    super(...args);
  }
  
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 560,
      height: 420,
      classes: ["quest", "sheet", "item"],
      resizable: true,
    });
  }

  /* -------------------------------------------- */
  
  get template() {
    const path = "systems/quest/templates/items";
    return `${path}/${this.item.data.type}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    return data;
  }

  /* -------------------------------------------- */
}
