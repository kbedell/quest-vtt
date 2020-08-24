import { compareLabels } from "../quest-helpers.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class PathAbilityAdder extends FormApplication {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "ability-ability-adder",
        classes: ["quest", "app", "path-ability-adder"],
        title: "Add Path Abilities",
        template: "systems/quest/templates/apps/path-ability-adder.html",
        width: 350,
        height: 400,
        resizable: true,
        data: {},
      });
    }
  
    /** @override */
    getData() {
      // Get current values
      let abilities = this.object.data.data.abilities || [];
  
      // Populate choices
      const choices = duplicate(this.options.choices);
  
      for (let [k, v] of Object.entries(choices)) {
        choices[k] = {
          label: v.name,
          id: v._id,
          chosen: abilities ? abilities.includes(v._id) : false,
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

      // Obtain choices
      const chosen = [];
      for (let [k, v] of Object.entries(formData)) {
        if (k !== "filter" && v) {
          chosen.push(k);
        }
      }
  
      updateData["data.abilities"] = chosen;
  
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
      html.find(".filter-abilities").keyup(this._updateFilter.bind(this));
    }
  
    _updateFilter(event) {
      event.preventDefault();
  
      let input = event.currentTarget.value;
      let filter = input.toLowerCase();
      let choices = document.getElementsByClassName("ability-choice");
  
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
  