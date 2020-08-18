import { ActorSheetQuest } from "./base.js";
import { RoleSelector } from "../../apps/role-selector.js";
import { AbilitySelector } from "../../apps/ability-selector.js";
import { getItem } from "../../quest-helpers.js";
import { getAllItems } from "../../quest-helpers.js";
import { getFullAbilityData } from "../../quest-helpers.js";
import { AbilityInfo } from "../../apps/ability-info.js";

/**
 * An Actor sheet for player character type actors in the Quest system.
 * Extends the base ActorSheetQuest class.
 * @type {ActorSheetQuest}
 */
export class CharacterSheetQuest extends ActorSheetQuest {
  /**
   * Define default rendering options for the NPC sheet
   * @return {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["quest", "sheet", "actor", "character"],
      width: 830,
      height: 690,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const sheetdata = super.getData();

    sheetdata.displayRoles = await this._getRoles(sheetdata.data.roles);
    sheetdata.displayAbilities = await this._getAbilities(sheetdata.data.abilities);

    return sheetdata;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited)
      return "systems/quest/templates/actors/limited-sheet.html";
    return "systems/quest/templates/actors/character-sheet.html";
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;

    html.find(".roll-generic").click(this._rollGeneric.bind(this));
    html.find(".role-selector").click(this._onRolesSelector.bind(this));
    html.find(".ability-selector").click(this._onAbilitySelector.bind(this));
    html.find(".ability-info").click(this._displayAbilityInfo.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling a generic for the Character
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _rollGeneric(event) {
    event.preventDefault();
    return this.actor.rollGeneric({ event: event });
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the RoleSelector application which allows a checkbox of multiple role options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  async _onRolesSelector(event) {
    event.preventDefault();
    const roles = await getAllItems("role");

    let options = {
      name: "roles",
      title: "Role(s)",
      choices: roles
    };

    new RoleSelector(this.actor, options).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the AbilitySelector application which allows a checkbox of multiple ability options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  async _onAbilitySelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const abilityMode = game.settings.get("quest", "abilityMode");
    const choices = [];

    if (abilityMode === "single-role" || abilityMode === "dual-roles" || abilityMode === "" || abilityMode === "default") {
      const roles = this.actor.data.data.roles;

      if (roles) {
        for (let i = 0; i < roles.length; i++) {
          let role = await getItem(roles[i], "role");
          let availablePaths = role.data.data.paths;

          if (!availablePaths) return;

          for (let p = 0; p < availablePaths.length; p++) {
            let path = await getItem(availablePaths[p], "path");
            let abilities = [];

            for (let a = 0; a < path.data.data.abilities.length; a++) {
              let abilityData = await getFullAbilityData(path.data.data.abilities[a]);

              let abilityOption = {
                name: abilityData.ability.name,
                id: abilityData.ability._id,
                order: a,
                effects: abilityData.effects
              };

              abilities.push(abilityOption);
            }

            choices.push({
              name: path.name,
              abilities: abilities,
            });
          }

          // Can't forget about legendaries
          let legendaries = role.data.data.legendaries;
          let legendaryOptions = [];

          for (let a = 0; a < legendaries.length; a++) {
            let ability = await getFullAbilityData(legendaries[a]);
            
            let abilityOption = {
              name: ability.ability.name,
              id: ability.ability._id,
              order: a,
              effects: ability.effects
            };

            legendaryOptions.push(abilityOption);
          }

          choices.push({
            name: "Legendaries",
            abilities: legendaryOptions
          });
        }
      }
    } else if (abilityMode === "quirks" || abilityMode === "no-roles") {
      const paths = getAllItems("path");

      if (!paths) return;

      for (let p = 0; p < paths.length; p++) {
        let abilityList = paths.abilities;
        let abilities = [];

        for (let a = 0; a < abilityList.length; a++) {
          let ability = {};
          let abilityData = await getItem(abilityList[a].id, "ability");

          ability = {
            name: abilityData.name,
            id: abilityData._id,
            order: a,
          };

          abilities.push(ability);
        }

        choices.push({
          name: path[p].name,
          abilities: abilities,
        });
      }
    }

    let options = {
      name: "abilities",
      title: "Abilities",
      choices: choices,
    };

    new AbilitySelector(this.actor, options).render(true);
  }

  async _getRoles(roles) {
    let roleData = [];

    for (let r = 0; r < roles.length; r++) {
      let role = {};
      let roleId = roles[r];
      
      role = await getItem(roleId, "role");

      if (!role) continue;

      roleData.push({
        name: role.data.name,
        id: role._id
      });
    }

    return roleData;
  }

  async _getAbilities(abilities) {
    let abilityData = [];

    for (let a = 0; a < abilities.length; a++) {
      let ability = {};
      let abilityId = abilities[a];

      ability = await getItem(abilityId, "ability");

      if (!ability) continue;

      abilityData.push({
        name: ability.data.name,
        id: ability._id
      })
    }

    return abilityData;
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
                description: ranges.description.value,
                min: ranges.min,
                max: ranges.max,
              });
            }
          }

          effectsText.push({
            description: effects[e].effect.data.data.description.value,
            cost: effects[e].effect.data.data.spellcost,
            ranges: ranges,
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
