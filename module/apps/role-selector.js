import { getItem } from "../quest-helpers.js";

/**
 * A specialized form used to select role(s)
 * @extends {FormApplication}
 */
export class RoleSelector extends FormApplication {
  /** @override */
  static get defaultOptions() {
    let maximum = null;
    const abilityMode = game.settings.get("quest", "abilityMode");

    switch (abilityMode) {
        case "dual-roles":
            maximum = 2;
            break;
        case "single-role":
            maximum = 1;
            break;
    }

    return mergeObject(super.defaultOptions, {
      id: "role-selector",
      classes: ["quest"],
      title: "Role Selection",
      template: "systems/quest/templates/apps/role-selector.html",
      width: 320,
      height: "auto",
      choices: {},
      minimum: 0,
      maximum: maximum
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Get current values
    let roles = this.object.data.data.roles || [];

    // Populate choices
    const choices = duplicate(this.options.choices);

    for (let [k,v] of Object.entries(choices) ) {
      choices[k] = {
        label: v.name,
        id: v._id,
        chosen: roles ? roles.includes(v._id) : false
      }
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
    let role = {};

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if (v) {
        role = await getItem(k, "role");
        chosen.push(role._id);
      }
    }
    
    updateData['data.roles'] = chosen;

    // Validate the number chosen
    if (this.options.minimum && chosen.length < this.options.minimum) {
      return ui.notifications.error(
        `You must choose at least ${this.options.minimum} options`
      );
    }
    if (this.options.maximum && chosen.length > this.options.maximum) {
      return ui.notifications.error(
        `You may choose no more than ${this.options.maximum} options`
      );
    }

    // Update the object
    this.object.update(updateData);
  }
}
