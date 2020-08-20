import { ItemSheetQuest } from "./base.js";
import { getItem } from "../../quest-helpers.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class AbilitySheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 550,
      height: "auto",
      classes: ["quest", "sheet", "item", "ability"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    data.displayEffects = await this._getEffects(data.data.effects);

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

    html.find(".item-delete").click(this._onDeleteEffect.bind(this));

    const effects = document.getElementById("effects");

    effects.addEventListener("dragover", this._onEffectDragOver.bind(this), false);
    effects.addEventListener("drop", this._onEffectDrop.bind(this), false);
    effects.addEventListener("dragenter", this._onEffectDragEnter.bind(this), false);
    effects.addEventListener("dragleave", this._onEffectDragLeave.bind(this), false);
    effects.addEventListener("dragend", this._onEffectDragEnd.bind(this), false);
  }

  async _onEffectDragStart(event) {
    event.stopPropagation();
    return this.item.onDragItemStart(event);
  }

  async _onEffectDragOver(event) {
    event.preventDefault();
    return this.item.onDragOver(event);
  }

  async _onEffectDrop(event){
    event.preventDefault();
    return this.item.onDrop(event);
  }

  async _onEffectDragEnter(event) {
    event.preventDefault();
    return this.item.onDragEnter(event);
  }

  async _onEffectDragLeave(event) {
    event.preventDefault();
    return this.item.onDragLeave(event);
  }

  async _onEffectDragEnd(event) {
    event.preventDefault();
    return this.item.onDragEnd(event);
  }

  async _getEffects(effects) {
    return this.item.getItems(effects, "effect");
  }

  async _onDeleteEffect(event) {
    event.preventDefault();
    return this.item.onDeleteItem(event);
  }
}
