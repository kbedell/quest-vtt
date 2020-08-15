import { ItemSheetQuest } from "./base.js";

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
      height: 440,
      classes: ["quest", "sheet", "item", "ability"],
      resizable: true,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    data.displayEffects = await this._getEffects(data.item);

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

    html.find(".item-delete").click(this._onDeleteItem.bind(this));

    this.form.ondragover = (ev) => this._onDragOver(ev);
    this.form.ondrop = (ev) => this._onDrop(ev);
    this.form.ondragenter = (ev) => this._onDragEnter(ev);
    this.form.ondragleave = (ev) => this._onDragLeave(ev);

    document.addEventListener("dragend", this._onDragEnd.bind(this));
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
      if (!this.item) return;

      if (data.pack) {
        if (this.item.data.type === "ability" && data.pack === "world.effects") {
          let updateData = duplicate(this.item.data);
          updateData.data.effects.push(data);
          await this.item.update(updateData);
        }
      } else {
        let effect = game.items.get(data.id);

        if (this.item.data.type === "ability" && effect.data.type === "effect") {
          let updateData = duplicate(this.item.data);
          updateData.data.effects.push(data);
          await this.item.update(updateData);
        }
      }

      event.target.classList.remove("hover");
      return false;

    } catch (err) {
      console.log("Quest Items | drop error");
      console.log(event.dataTransfer.getData("text/plain"));
      console.log(err);
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

  async _getEffects(item) {
    let effects = [];
    let effect = {};


    for (var i = 0; i < item.data.effects.length; i++) {
      let newEffect = {};
      let effectId = item.data.effects[i];

      if (effectId.pack) {
        let pack = game.packs.find((p) => p.collection === effectId.pack);
        effect = await pack.getEntity(effectId.id);
      } else {
        effect = game.items.get(effectId.id);
      }

      newEffect = {
        name: effect.data.name,
        id: effect._id
      };

      effects.push(newEffect);
    }

    return effects;
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
