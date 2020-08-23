import { ItemSheetQuest } from "./base.js";
import { PathAdder } from "../../apps/path-adder.js"
import { LegendaryAdder } from "../../apps/legendary-adder.js"
import { getAllItems } from "../../quest-helpers.js";

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
    const item = data.item;

    if (item.img === "icons/svg/mystery-man.svg") {
      item.img = "systems/quest/icons/upgrade.png";
    }

    item.displayPaths = await this._getPaths(data.data.paths);
    item.displayAbilities = await this._getLegendaries(data.data.legendaries);

    return item;
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
    html.find(".adder-paths").click(this._onPathAdder.bind(this));
    html.find(".adder-legendaries").click(this._onLegendaryAdder.bind(this));
    html.find(".delete").click(this._onDeletePathAbility.bind(this));
  }

  async _onPathAdder(event) {
    event.preventDefault();

    const paths = await getAllItems("path");

    let options = {
      choices: paths
    };

    new PathAdder(this.item, options).render(true);
  }

  async _onLegendaryAdder(event) {
    event.preventDefault();

    const abilities = await getAllItems("ability");
    let legendaries = [];

    for (let a = 0; a < abilities.length; a++) {
      if (abilities[a].data.legendary) {
        legendaries.push(abilities[a]);
      }
    }

    let options = {
      choices: legendaries
    };

    new LegendaryAdder(this.item, options).render(true);
  }

  async _getPaths(paths) {
    return this.item.getItems(paths, "path");
  }

  async _getLegendaries(legendaries) {
    return this.item.getItems(legendaries, "ability");
  }

  async _onDeletePathAbility(event) {
    event.preventDefault();
    return this.item.onDeleteItem(event);
  }
}
