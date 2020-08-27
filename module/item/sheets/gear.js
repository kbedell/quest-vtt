import { ItemSheetQuest } from "./base.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class GearSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 450,
      height: "auto",
      classes: ["quest", "sheet", "item", "gear"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM)
      return "systems/quest/templates/items/gear-limited.html";
    return "systems/quest/templates/items/gear.html";
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    if (data.item.img === "icons/svg/mystery-man.svg") {
      data.item.img = "systems/quest/icons/potion-ball.png"
    }

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
