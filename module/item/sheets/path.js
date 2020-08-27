import { ItemSheetQuest } from "./base.js";
import { getAllItems } from "../../quest-helpers.js";
import { PathAbilityAdder } from "../../apps/path-ability-adder.js";

/**
 * An Item sheet for path type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class PathSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 450,
      height: "auto",
      classes: ["quest", "sheet", "item", "path"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();

    if (data.item.img === "icons/svg/mystery-man.svg") {
      data.item.img = "systems/quest/icons/skills.png"
    }

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

    html.find(".delete").click(this._onDeleteAbility.bind(this));
    html.find(".adder-abilities").click(this._onAbilityAdder.bind(this));

    // Item Dragging
    html.find("li.ability").each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", this._onReorderDragStart.bind(this), false);
      li.addEventListener("dragover", this._onReorderDragOver.bind(this), false);
      li.addEventListener("dragenter", this._onReorderDragEnter.bind(this), false);
      li.addEventListener("dragleave", this._onReorderDragLeave.bind(this), false);
      li.addEventListener("dragend", this._onReorderDragEnd.bind(this), false);
    });
  }
  
  async _getAbilities(abilities) {
    return this.item.getItems(abilities, "ability");
  }

  async _onDeleteAbility(event) {
    event.preventDefault();
    return this.item.onDeleteItem(event);
  }

  _onReorderDragStart(event) {
    event.currentTarget.classList.add('dragging');
  }

  async _onReorderDragEnd(event) {
    let draggables = document.querySelectorAll(".ability");
    let newOrder = [];

    draggables.forEach(draggable => {
      draggable.classList.remove('dragging');
      let id = draggable.dataset.itemId;
      newOrder.push(id);
    });

    let updateData = duplicate(this.item.data);
    updateData.data.abilities = newOrder;

    await this.item.update(updateData);
    this.render(true);
    return false;
  }

  _onReorderDragOver(event) {
    event.preventDefault();
    
    let containers = document.querySelectorAll(".abilities-list");

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

  _onReorderDragEnter(event) {
    event.preventDefault();
    return false;
  }

  _onReorderDragLeave(event) {
    event.preventDefault();
    return false;
  }


  async _reorderAbilities(event) {
    let list = document.getElementById("abilities-list");
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

  async _onAbilityAdder(event) {
    event.preventDefault();

    const abilities = await getAllItems("ability", false);

    let options = {
      choices: abilities
    };

    new PathAbilityAdder(this.item, options).render(true);
  }
}
