import { ItemSheetQuest } from "./base.js";
import { getItem } from "../../quest-helpers.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class RoleSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 550,
      height: "auto",
      classes: ["quest", "sheet", "item", "role"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    data.displayPaths = await this._getPaths(data.data.paths);
    data.displayAbilities = await this._getAbilities(data.data.legendaries);

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

    html.find(".item-delete").click(this._onDeletePathAbility.bind(this));

    const paths = document.getElementById("paths");
    
    paths.addEventListener("dragover", this._onPathAbilityDragOver.bind(this), false);
    paths.addEventListener("drop", this._onPathAbilityDrop.bind(this), false);
    paths.addEventListener("dragenter", this._onPathAbilityDragEnter.bind(this), false);
    paths.addEventListener("dragleave", this._onPathAbilityDragLeave.bind(this), false);
    paths.addEventListener("dragend", this._onPathAbilityDragEnd.bind(this), false);

    const abilities = document.getElementById("abilities");

    abilities.addEventListener("dragover", this._onPathAbilityDragOver.bind(this), false);
    abilities.addEventListener("drop", this._onPathAbilityDrop.bind(this), false);
    abilities.addEventListener("dragenter", this._onPathAbilityDragEnter.bind(this), false);
    abilities.addEventListener("dragleave", this._onPathAbilityDragLeave.bind(this), false);
    abilities.addEventListener("dragend", this._onPathAbilityDragEnd.bind(this), false);
    
    // document.addEventListener("dragend", this._onDragEnd.bind(this));
  }

  async _onPathAbilityDragStart(event) {
    event.stopPropagation();
    return this.item.onDragItemStart(event);
  }

  async _onPathAbilityDragOver(event) {
    event.preventDefault();
    return this.item.onDragOver(event);
  }

  async _onPathAbilityDrop(event){
    event.preventDefault();
    return this.item.onDrop(event);
  }

  async _onPathAbilityDragEnter(event) {
    event.preventDefault();
    return this.item.onDragEnter(event);
  }

  async _onPathAbilityDragLeave(event) {
    event.preventDefault();
    return this.item.onDragLeave(event);
  }

  async _onPathAbilityDragEnd(event) {
    event.preventDefault();
    return this.item.onDragEnd(event);
  }

  async _getPaths(paths) {
    return this.item.getItems(paths, "path");
  }

  async _getAbilities(abilities)  {
    return this.item.getItems(abilities, "ability");
  }

  async _onDeletePathAbility(event) {
    event.preventDefault();
    return this.item.onDeleteItem(event);
  }
}
