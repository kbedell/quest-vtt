import { AbilityInfo } from "./ability-info.js";
import { getItem} from "../quest-helpers.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class AbilitySelector extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "ability-selector",
      classes: ["quest", "app", "ability-selector"],
      title: "Ability Selection",
      template: "systems/quest/templates/apps/ability-selector.html",
      width: 320,
      height: 400,
      resizable: true,
      choices: {},
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Get current values
    const abilities = this.object.data.data.abilities;

    // Populate choices
    const options = duplicate(this.options.choices);
    const choices = [];
    let roles = false;

    if (this.options.roles) {
      roles = true;
      for (let r = 0; r < options.length; r++) {
        const pathData = [];
        for (let p = 0; p < options[r].paths.length; p++) {
          let path = options[r].paths[p];
          const abilityData = [];
          let cost = "0";

          for (let a = 0; a < path.abilities.length; a++) {
            let effects = path.abilities[a].effects;
            let available = false;

            if (effects.length > 1) {
              cost = "x";
            } else if (effects.length === 1) {
              if (
                !effects[0].variablecost &&
                effects[0].spellcost != "" &&
                parseInt(effects[0].spellcost) > 0
              ) {
                cost = effects[0].spellcost;
              } else if (effects[0].variablecost) {
                cost = "x";
              }
            }

            let previous = a - 1;

            if (a === 0) {
              available = true;
            } else if (
              a > 0 &&
              abilities &&
              abilities.includes(path.abilities[previous].id)
            ) {
              available = true;
            }

            abilityData.push({
              label: path.abilities[a].name,
              id: path.abilities[a].id,
              order: a,
              chosen: abilities
                ? abilities.includes(path.abilities[a].id)
                : false,
              available: available,
              cost: cost,
            });
          }

          pathData.push({
            name: path.name,
            id: path.id,
            abilities: abilityData
          });
        }

        choices.push({
          name: options[r].role,
          id: options.id,
          paths: pathData
        });
      }
    } else {
      for (let h = 0; h < options.length; h++) {
        const abilityData = [];
        let cost = "0";

        for (let a = 0; a < options[h].abilities.length; a++) {
          let effects = options[h].abilities[a].effects;
          let available = false;

          if (effects.length > 1) {
            cost = "x";
          } else if (effects.length === 1) {
            if (
              !effects[0].variablecost &&
              effects[0].spellcost != "" &&
              parseInt(effects[0].spellcost) > 0
            ) {
              cost = effects[0].spellcost;
            } else if (effects[0].variablecost) {
              cost = "x";
            }
          }

          let previous = a - 1;

          if (a === 0) {
            available = true;
          } else if (
            a > 0 &&
            abilities &&
            abilities.includes(options[h].abilities[previous].id)
          ) {
            available = true;
          }

          abilityData.push({
            label: options[h].abilities[a].name,
            id: options[h].abilities[a].id,
            order: a,
            chosen: abilities
              ? abilities.includes(options[h].abilities[a].id)
              : false,
            available: available,
            cost: cost,
          });
        }

        choices.push({
          name: options[h].name,
          id: options[h].id,
          abilities: abilityData,
        });
      }
    }

    return {
      roles: roles,
      choices: choices,
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    const updateData = {};
    let ability = {};

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if (v) {
        ability = await getItem(k, "ability");
        chosen.push(ability._id);
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
    html.find(".ability-info-list").click(this._displayAbilityInfo.bind(this));
    html.find(".path-name").click(this._toggleAbilityList.bind(this));
    html.find(".ability-check-toggle").click(this._onToggleDisable.bind(this));
  }

  async _displayAbilityInfo(event) {
    event.preventDefault();
    let options = {};

    let ability = await getItem(
      event.target.parentNode.dataset.itemId,
      "ability"
    );

    if (ability.data.effects.length > 0) {
      let effects = ability.data.effects;
      let effectsText = [];

      for (let e = 0; e < effects.length; e++) {
        let rangeText = [];
        let roll = false;
        if (effects[e].ranges.length > 0) {
          let ranges = effects[e].ranges;

          if (ranges.length > 0) {
            roll = true;
            for (let r = 0; r < ranges.length; r++) {
              rangeText.push({
                description: ranges[r].description.full,
                min: ranges[r].min,
                max: ranges[r].max,
              });
            }
          }
        }

        let cost = "0";

        if (Boolean(effects[e].variablecost)) {
          cost = "x";
        } else {
          cost = effects[e].spellcost;
        }

        effectsText.push({
          name: effects[e].name,
          description: effects[e].description.full,
          cost: cost,
          ranges: rangeText,
          roll: roll,
        });
      }

      options = {
        name: ability.data.name,
        id: ability.data._id,
        legendary: ability.data.legendary,
        description: ability.data.data.description.full,
        effects: effectsText,
      };
    }

    new AbilityInfo(this.actor, options).render(true);
  }

  _toggleAbilityList(event) {
    event.preventDefault();

    let display = event.currentTarget.parentNode.children[2];
    let toggleOff = event.currentTarget.parentNode.children[1];
    let toggleOn = event.currentTarget.parentNode.children[0];

    if (display.className === "ability-selector-list hide") {
      display.classList.remove("hide");
      toggleOff.classList.remove("hide");
      toggleOn.classList.add("hide");
    } else {
      display.classList.add("hide");
      toggleOff.classList.add("hide");
      toggleOn.classList.remove("hide");
    }
  }

  async _onToggleDisable(event) {
    const index = event.currentTarget.dataset.index;
    const pathId = event.currentTarget.dataset.pathId;

    let checks = document.querySelectorAll(".ability-check-" + pathId);
    let checked = event.currentTarget.checked;

    if (!checked) {
      for (let i = checks.length; i > 0; i--) {
        if (i - 1 >= index && i - 1 !== 0) {
          checks[i - 1].checked = false;
          checks[i - 1].disabled = true;
          checks[i - 1].parentNode.classList.add("disabled");
        }
      }
    } else {
      let next = parseInt(index) + 1;
      if (checks[next]) {
        checks[next].disabled = false;
        checks[next].parentNode.classList.remove("disabled");
      }
    }
  }
}
