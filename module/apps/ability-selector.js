import { getFullAbilityData } from "../quest-helpers.js";
import { AbilityInfo } from "./ability-info.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class AbilitySelector extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "ability-selector",
      classes: ["quest"],
      title: "Ability Selection",
      template: "systems/quest/templates/apps/ability-selector.html",
      width: 320,
      height: "auto",
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

    for (let h = 0; h < options.length; h++) {
      const abilityData = [];
      let cost = "0";
      let available = false;

      for (let a = 0; a < options[h].abilities.length; a++) {
        let effects = options[h].abilities[a].effects;

        if (effects.length > 1) {
          cost = "X";
        } else if (effects.length === 1) {
          cost = effects[0].effect.data.spellcost;
        }

        if (a === 0) {
          available = true;
        } else if (
          a > 0 &&
          abilities.includes(options[h].abilities[a - 1].id)
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
        abilities: abilityData,
      });
    }

    return {
      choices: choices,
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {
    const updateData = {};
    const pack = game.packs.find((p) => p.collection === "world.abilities");
    let ability = {};

    // Obtain choices
    const chosen = [];
    for (let [k, v] of Object.entries(formData)) {
      if (v) {
        if (pack && v) {
          ability = await pack.getEntity(k);
        } else if (v) {
          ability = game.items.get(k);
        }

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
    html.find(".ability-info").click(this._displayAbilityInfo.bind(this));
  }

  async _displayAbilityInfo(event) {
    event.preventDefault();
    let options = {};

    let ability = await getFullAbilityData(
      event.target.parentNode.dataset.itemId
    );

    if (ability.effects.length > 0) {
      let effects = ability.effects;
      let effectsText = [];

      for (let e = 0; e < effects.length; e++) {
        if (ability.effects.length > 0) {
          let ranges = effects[e].ranges;
          let rangeText = [];

          if (ranges.length > 0) {
            for (let r = 0; r < ranges.length; r++) {
              rangeText.push({
                description: ranges[r].data.data.description.value,
                min: ranges[r].data.data.min,
                max: ranges[r].data.data.max,
              });
            }
          }

          effectsText.push({
            description: effects[e].effect.data.data.description.value,
            cost: effects[e].effect.data.data.spellcost,
            ranges: rangeText,
          });
        }
      }

      options = {
        name: ability.ability.name,
        legendary: ability.ability.legendary,
        effects: effectsText,
      };
    }

    new AbilityInfo(this.actor, options).render(true);
  }
}
