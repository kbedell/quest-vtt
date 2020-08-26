/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class PathAdder extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "path-adder",
      classes: ["quest", "app", "path-adder"],
      title: game.i18n.localize('QUEST.AddLearningPaths'),
      template: "systems/quest/templates/apps/path-adder.html",
      width: 350,
      height: 400,
      resizable: true,
      data: {},
    });
  }

  /** @override */
  getData() {
    // Get current values
    let paths = this.object.data.data.paths || [];

    // Populate choices
    const choices = duplicate(this.options.choices);

    for (let [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v.name,
        id: v._id,
        chosen: paths ? paths.includes(v._id) : false,
      };
    }

    // Return data
    return {
      choices: choices,
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    const updateData = {};
    let path = {};

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if (k !== "filter" && k !== "submit" && v) {
        chosen.push(k);
      }
    }

    updateData["data.paths"] = chosen;

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
    html.find(".filter-paths").keyup(this._updateFilter.bind(this));
  }

  _updateFilter(event) {
    event.preventDefault();

    let input = event.currentTarget.value;
    let filter = input.toLowerCase();
    let list = document.getElementById("path-list");
    let choices = document.getElementsByClassName("path-choice");

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
