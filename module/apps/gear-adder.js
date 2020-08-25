import { compareLabels, getItem } from "../quest-helpers.js";

/**
 * A specialized form used to add a copy of an item to a character
 * @extends {FormApplication}
 */
export class GearAdder extends FormApplication {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "gear-adder",
        classes: ["quest", "app", "gear-adder"],
        title: "Add Gear",
        template: "systems/quest/templates/apps/gear-adder.html",
        width: 500,
        height: "auto",
        resizable: true,
        minimum: 0,
        maximum: 1,
        data: {},
      });
    }

      /** @override */
  getData() {
    const choices = duplicate(this.options.choices);

    for (let [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v.name,
        id: v._id
      };
    }

    choices.sort(compareLabels);

    // Return data
    return {
      choices: choices,
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    event.preventDefault();
    const index = Number(this.options.index);
    const inventory = this.object.data;
    let newInventory = [];
    let gear = {};

    // Obtain choices
    for (let [k, v] of Object.entries(formData)) {
      if (k !== "filter" && k !== "submit" && v) {
        gear = await getItem(k, "gear");
      }
    }

    let newItem = await this.object.createEmbeddedEntity("OwnedItem", gear, {temporary: false});

    for (let i = 0; i < inventory.data.inventory.length; i++) {
      if (i === index) {
        newInventory.push({
          value: newItem._id,
          association: true
        });
      } else {
        newInventory.push({
          value: inventory.data.inventory[i].value,
          association: inventory.data.inventory[i].association
        });
      }
    }

    const updateData = duplicate(this.object.data);

    updateData.data.inventory = newInventory;

    await this.object.update(updateData);

    return false;
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
    html.find(".filter-gear").keyup(this._updateFilter.bind(this));
  }

  _updateFilter(event) {
    event.preventDefault();

    let input = event.currentTarget.value;
    let filter = input.toLowerCase();
    let list = document.getElementById("gearlist");
    let choices = document.getElementsByClassName("gearchoice");

    for (let i = 0; i < choices.length; i++) {
        let text = choices[i].children[0].innerText.trim();

        if (text.toLowerCase().indexOf(filter) > -1) {
            choices[i].style.display = "";
        } else {
            choices[i].style.display = "none";
        }
    }
  }
}