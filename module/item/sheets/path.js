import { ItemSheetQuest } from "./base.js";
import { getItem } from "../../quest-helpers.js";

/**
 * An Item sheet for path type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class PathSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 580,
      height: "auto",
      classes: ["quest", "sheet", "item", "path"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    data.displayAbilities = await this._getAbilities(data.data.abilities);

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
    
    const abilities = document.getElementById("abilities");

    abilities.addEventListener("dragover", this._onDragOver.bind(this), false);
    abilities.addEventListener("drop", this._onDrop.bind(this), false);
    abilities.addEventListener("dragenter", this._onDragEnter.bind(this), false);
    abilities.addEventListener("dragleave", this._onDragLeave.bind(this), false);
    abilities.addEventListener("dragend", this._onDragEnd.bind(this), false);

    // Item Dragging
    html.find("li.ability").each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", this._handleDragStart.bind(this), false);
      li.addEventListener("dragover", this._handleDragOver.bind(this), false);
      li.addEventListener("dragenter", this._handleDragEnter.bind(this), false);
      li.addEventListener("dragleave", this._handleDragLeave.bind(this), false);
      li.addEventListener("dragend", this._handleDragEnd.bind(this), false);
    });
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

  _handleDragStart(event) {
    event.currentTarget.classList.add('dragging');
  }

  _handleDragEnd(event) {
    let draggables = document.querySelectorAll(".ability");

    draggables.forEach(draggable => {
      draggable.classList.remove('dragging');
    });
  }

  _handleDragOver(event) {
    event.preventDefault();
    
    let containers = document.querySelectorAll(".item-abilities");

    containers.forEach(async (container) => {
      const afterElement = this._getDragAfterElement(container, event.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement === null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });

    return false;
  }

  _handleDragEnter(event) {
    event.preventDefault();
    return false;
  }

  _handleDragLeave(event) {
    event.preventDefault();
    return false;
  }

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (!this.item) return false;

      let updateData = duplicate(this.item.data);

      if (this.item.data.type === "path") {
        let gameItem = game.items.get(data.id);

        if ((data.pack && data.pack === "quest-basic.abilities") || (data.pack && data.pack === "world.abilities") || gameItem) {
          updateData.data.abilities.push(data.id);
          await this.item.update(updateData);
        }
      }
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

  async _getAbilities(abilities) {
    let displayAbilities = [];

    for (let i = 0; i < abilities.length; i++) {
      let id = abilities[i];

      let ability = await getItem(id, "ability");

      let newAbility = {
        name: ability.data.name,
        id: ability._id
      };

      displayAbilities.push(newAbility);
    }

    return displayAbilities;
  }

  async _onDeleteItem(event) {
    event.preventDefault();

    let updateData = duplicate(this.item.data);
    const abilityId = Number(
      event.currentTarget.closest(".item").dataset.itemId
    );
    updateData.data.abilities.splice(abilityId, 1);

    await this.item.update(updateData);
    this.render(true);
    return false;
  }

  async _reorderAbilities(event) {
    let list = document.getElementById("item-abilities");
    let newOrder = [];
    let updateData = duplicate(this.item.data);

    for (let i = 0; i < list.children.length; i++) {
      let child = list.children[i].dataset.itemId;
      
      for (let h = 0; h < updateData.data.abilities.length; h++) {
        if (updateData.data.abilities[h].id === child ) {
          newOrder.push(updateData.data.abilities[h]);
        }
      }
    }

    updateData.data.abilities = newOrder;
    await this.item.update(updateData);
    this.render(true);
    return false;
  }

  _getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".ability:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
}
