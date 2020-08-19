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
      width: 460,
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

    html.find(".item-delete").click(this._onDeleteItem.bind(this));

    const effects = document.getElementById("effects");

    effects.addEventListener("dragover", this._onDragOver.bind(this), false);
    effects.addEventListener("drop", this._onDrop.bind(this), false);
    effects.addEventListener("dragenter", this._onDragEnter.bind(this), false);
    effects.addEventListener("dragleave", this._onDragLeave.bind(this), false);
    effects.addEventListener("dragend", this._onDragEnd.bind(this), false);
  }

  async _onDragItemStart(event) {
    event.stopPropagation();
    const itemId = Number(event.currentTarget.dataset.itemId);
    let item = items.find((i) => i._id === itemId);
    item = duplicate(item);
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        data: item,
      })
    );
  }

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (!this.item) return false;

      let updateData = duplicate(this.item.data);

      if (this.item.data.type === "ability") {
        let gameItem = game.items.get(data.id);

        if ((data.pack && data.pack === "quest-basics.effects") || gameItem) {
          updateData.data.effects.push(data.id);
          await this.item.update(updateData);
        }
      }
    } catch (err) {
      console.log("Quest Items | drop error");
      console.log(event.dataTransfer.getData("text/plain"));
      console.log(err);
    } finally {
      event.target.classList.remove("hover");
      return false;
    }
  }

  _onDragEnd(event) {
    event.preventDefault();
    return false;
  }
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  _onDragEnter(event) {
    event.preventDefault();
    if (event.target.className === "adder") {
      event.target.classList.add("hover");
    }
    return false;
  }

  _onDragLeave(event) {
    event.preventDefault();
    if (event.target.className === "adder hover") {
      event.target.classList.remove("hover");
    }
    return false;
  }

  async _getEffects(effects) {
    let displayEffects = [];

    for (let i = 0; i < effects.length; i++) {
      let id = effects[i];

      let effect = await getItem(id, "effect");

      let newEffect = {
        name: effect.data.name,
        id: effect._id
      };

      displayEffects.push(newEffect);
    }

    return displayEffects;
  }

  async _onDeleteItem(event) {
    event.preventDefault();

    let updateData = duplicate(this.item.data);
    const effectId = Number(event.currentTarget.closest(".item").dataset.itemId);
    updateData.data.effects.splice(effectId, 1);

    await this.item.update(updateData);
    this.render(true);
    return false;
  }
}
