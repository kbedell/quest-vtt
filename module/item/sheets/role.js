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
      width: 460,
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

    html.find(".item-delete").click(this._onDeleteItem.bind(this));

    const paths = document.getElementById("paths");
    
    paths.addEventListener("dragover", this._onDragOver.bind(this), false);
    paths.addEventListener("drop", this._onDrop.bind(this), false);
    paths.addEventListener("dragenter", this._onDragEnter.bind(this), false);
    paths.addEventListener("dragleave", this._onDragLeave.bind(this), false);
    paths.addEventListener("dragend", this._onDragEnd.bind(this), false);

    const abilities = document.getElementById("abilities");

    abilities.addEventListener("dragover", this._onDragOver.bind(this), false);
    abilities.addEventListener("drop", this._onDropAbility.bind(this), false);
    abilities.addEventListener("dragenter", this._onDragEnter.bind(this), false);
    abilities.addEventListener("dragleave", this._onDragLeave.bind(this), false);
    abilities.addEventListener("dragend", this._onDragEnd.bind(this), false);
    
    // document.addEventListener("dragend", this._onDragEnd.bind(this));
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
      if (this.item.data.type === "role") {
        let gameItem = game.items.get(data.id);

        if ((data.pack && data.pack === "quest-basics.paths") || gameItem) {
          updateData.data.paths.push(data.id);
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

  async _onDropAbility(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (!this.item) return false;

      let updateData = duplicate(this.item.data);
      if (this.item.data.type === "role") {
        let gameItem = game.items.get(data.id);

        if ((data.pack && data.pack === "quest-basics.abilities") || gameItem) {
          updateData.data.legendaries.push(data.id);
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

  async _getPaths(paths) {
    let displayPaths = [];

    for (let i = 0; i < paths.length; i++) {
      let id = paths[i];

      let path = await getItem(id, "path");

      let newPath = {
        name: path.data.name,
        id: path._id
      };

      displayPaths.push(newPath);
    }

    return displayPaths;
  }

  async _getAbilities(abilities) {
    let displayAbilities = [];

    for (let i = 0; i < abilities.length; i++) {
      let id = abilities[i];

      let ability = await getItem(id, "ability");

      let newAbility = {
        name: ability.data.name,
        id: ability._id
      }

      displayAbilities.push(newAbility);
    }

    return displayAbilities;
  }

  async _onDeleteItem(event) {
    event.preventDefault();

    let updateData = duplicate(this.item.data);
    const pathId = Number(event.currentTarget.closest(".item").dataset.itemId);
    updateData.data.paths.splice(pathId, 1);

    await this.item.update(updateData);
    this.render(true);
    return false;
  }
}
