import { ItemSheetQuest } from "./base.js";
import { getAllItems } from "../../quest-helpers.js";
import { QUEST } from "../../config.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class GearSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 550,
      height: "auto",
      classes: ["quest", "sheet", "item", "gear"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.QUEST;
    data.rarities = this._getItemRarities(data.item.data.rarity);
    return data;
  }

  /* -------------------------------------------- */

  _getItemRarities(rarity) {
    const rarities = CONFIG.QUEST.rarities;
    let display = [];

    for (let [k, v] of Object.entries(rarities)) {
      display.push({
        selected: rarity ? rarity.value === k : false,
        value: k,
        display: v,
      });
    }

    return {
      choices: display,
      custom: rarity ? rarity.custom : "",
    };
  }
}
