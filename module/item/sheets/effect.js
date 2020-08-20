import { ItemSheetQuest } from "./base.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class EffectSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 600,
      height: "auto",
      classes: ["quest", "sheet", "item", "effect"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    data.displayRanges = await this._getRanges(data.data.ranges);

    return data;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    if (!game.user.isGM) return;

    html.find(".item-delete").click(this._onDeleteRange.bind(this));

    const ranges = document.getElementById("ranges");

    ranges.addEventListener("dragover", this._onRangeDragOver.bind(this), false);
    ranges.addEventListener("drop", this._onRangeDrop.bind(this), false);
    ranges.addEventListener("dragenter", this._onRangeDragEnter.bind(this), false);
    ranges.addEventListener("dragleave", this._onRangeDragLeave.bind(this), false);
    ranges.addEventListener("dragend", this._onRangeDragEnd.bind(this), false);
  }

  async _onRangeDragStart(event) {
    event.stopPropagation();
    return this.item.onDragItemStart(event);
  }

  async _onRangeDragOver(event) {
    event.preventDefault();
    return this.item.onDragOver(event);
  }

  async _onRangeDrop(event){
    event.preventDefault();
    return this.item.onDrop(event);
  }

  async _onRangeDragEnter(event) {
    event.preventDefault();
    return this.item.onDragEnter(event);
  }

  async _onRangeDragLeave(event) {
    event.preventDefault();
    return this.item.onDragLeave(event);
  }

  async _onRangeDragEnd(event) {
    event.preventDefault();
    return this.item.onDragEnd(event);
  }

  async _getRanges(ranges) {
    return this.item.getItems(ranges, "ranges");
  }

  async _onDeleteRange(event) {
    event.preventDefault();
    return this.item.onDeleteItem(event);
  }
}
