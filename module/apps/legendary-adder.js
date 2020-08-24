import { compareLabels } from "../quest-helpers.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class LegendaryAdder extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "legendary-adder",
      classes: ["quest", "app", "legendary-adder"],
      title: "Add Legendary Abilities",
      template: "systems/quest/templates/apps/legendary-adder.html",
      width: 350,
      height: 400,
      resizable: true,
      data: {},
    });
  }

  /** @override */
  getData() {
    // Get current values
    let legendaries = this.object.data.data.legendaries || [];

    // Populate choices
    const choices = duplicate(this.options.choices);

    for (let [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v.name,
        id: v._id,
        chosen: legendaries ? legendaries.includes(v._id) : false,
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
    const updateData = {};
    let legendary = {};

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if (k !== "filter" && v) {
        chosen.push(k);
      }
    }

    updateData["data.legendaries"] = chosen;

    // Update the object
    this.object.update(updateData);
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
    html.find(".filter-legendaries").keyup(this._updateFilter.bind(this));
  }

  _updateFilter(event) {
    event.preventDefault();

    let input = event.currentTarget.value;
    let filter = input.toLowerCase();
    let list = document.getElementById("legendary-list");
    let choices = document.getElementsByClassName("legendary-choice");

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
