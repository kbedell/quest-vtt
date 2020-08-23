import { ActorSheetQuest } from "./base.js";
import { RoleSelector } from "../../apps/role-selector.js";
import { AbilitySelector } from "../../apps/ability-selector.js";
import { getItem } from "../../quest-helpers.js";
import { getAllItems } from "../../quest-helpers.js";
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
    sheetdata.displayAbilities = await this._getAbilities(
      sheetdata.data.abilities
    );

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

  async _render(force, options) {

    await super._render(force, options);

    let active = document.activeElement;

    if (active.classList.contains("inventory-item-value")) {
      let pos = active.value.length;
      active.selectionEnd = pos;
      active.selectionStart = pos;
    }

    return false;
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

    html.find(".send-to-chat-default").click(this._onSendToChat.bind(this));
    html.find(".ability-name-toggle").click(this._toggleEffectList.bind(this));

    if (!this.options.editable) return;
    if (this.actor.owner) {
      html.find(".inventory-delete").click(this._onInventoryDelete.bind(this));
      html
        .find(".inventory-item-value")
        .keyup(this._updateInventoryCheck.bind(this));
      html
        .find(".inventory-item-value")
        .change(this._updateInventory.bind(this));
      html.find(".inventory-sort").click(this._onSort.bind(this));
      html.find(".roll-generic").click(this._rollGeneric.bind(this));
      html.find(".role-selector").click(this._onRolesSelector.bind(this));
      html.find(".ability-selector").click(this._onAbilitySelector.bind(this));
      html.find(".ability-info").click(this._displayAbilityInfo.bind(this));
      html.find(".roll-ability").click(this._rollAbility.bind(this));

      let handler = (ev) => this._onDragAbilityStart(ev);

      html.find("li.ability").each((i, li) => {
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling a generic for the Character
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _rollGeneric(event) {
    event.preventDefault();
    return this.actor.rollGeneric({ event: event, actor: this.actor.data });
  }

  /**
   * Handle rolling an ability for the Character
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _rollAbility(event) {
    event.preventDefault();
    let effectId = event.target.parentNode.dataset.itemId;
    let abilityId = event.target.parentNode.dataset.abilityId;
    return this.actor.rollAbility({
      event: event,
      actor: this.actor.data,
      effectId: effectId,
      abilityId: abilityId,
    });
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
      choices: roles,
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
    const abilityMode = game.settings.get("quest", "abilityMode");
    const choices = [];

    if (abilityMode === "single-role" || abilityMode === "dual-roles") {
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
              let abilityData = await getItem(
                path.data.data.abilities[a],
                "ability"
              );

              let abilityOption = {
                name: abilityData.data.name,
                id: abilityData.data._id,
                order: a,
                effects: abilityData.data.data.effects,
              };

              abilities.push(abilityOption);
            }

            choices.push({
              name: path.name,
              id: path._id,
              abilities: abilities,
            });
          }

          // Can't forget about legendaries
          let legendaries = role.data.data.legendaries;
          let legendaryOptions = [];

          for (let a = 0; a < legendaries.length; a++) {
            let abilityData = await getItem(legendaries[a], "ability");

            let abilityOption = {
              name: abilityData.data.name,
              id: abilityData.data._id,
              order: a,
              effects: abilityData.data.data.effects,
            };

            legendaryOptions.push(abilityOption);
          }

          if (legendaryOptions.length > 0) {
            choices.push({
              name: "Legendaries",
              abilities: legendaryOptions,
            });
          }
        }
      }
    } else if (abilityMode === "quirks" || abilityMode === "no-roles") {
      const paths = await getAllItems("path");

      if (!paths) return;

      for (let p = 0; p < paths.length; p++) {
        let abilityList = paths[p].data.abilities;
        let abilities = [];

        for (let a = 0; a < abilityList.length; a++) {
          let ability = {};
          let abilityData = await getItem(abilityList[a], "ability");

          ability = {
            name: abilityData.data.name,
            id: abilityData.data._id,
            order: a,
            effects: abilityData.data.data.effects,
          };

          abilities.push(ability);
        }

        choices.push({
          name: paths[p].name,
          id: paths[p]._id,
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
        id: role._id,
      });
    }

    return roleData;
  }

  async _getAbilities(abilities) {
    let abilityData = [];

    for (let a = 0; a < abilities.length; a++) {
      let ability = {};
      let abilityId = abilities[a];
      let roll = false;
      let multi = false;
      let cost = "0";

      ability = await getItem(abilityId, "ability");

      let effects = ability.data.data.effects;
      let effectData = [];

      for (let e = 0; e < effects.length; e++) {
        let effect = effects[e];

        if (effect.ranges.length > 0) {
          roll = true;
        }

        effectData.push({
          name: effect.name,
          id: e,
          roll: roll,
          cost: effect.spellcost,
          variablecost: Boolean(effect.variablecost)
        });
      }

      if (!ability) continue;

      if (effectData.length > 1) {
        cost = "x";
        multi = true;
      } else if (effectData.length === 1) {
        if ((!effectData[0].variablecost) && effectData[0].cost != "" && parseInt(effectData[0].cost) >= 0) {
          cost = effectData[0].cost;
        } else {
          cost = "x";
        }
      }

      abilityData.push({
        name: ability.data.name,
        id: ability._id,
        cost: cost,
        multi: multi,
        effects: effectData,
      });
    }

    return abilityData;
  }

  async _displayAbilityInfo(event) {
    event.preventDefault();
    let options = {};

    let ability = await getItem(
      event.target.parentNode.dataset.itemId,
      "ability"
    );

    if (ability.data.data.effects.length > 0) {
      let effects = ability.data.data.effects;
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
        effects: effectsText,
      };
    }

    new AbilityInfo(this.actor, options).render(true);
  }

  async _onSendToChat(event) {
    const id = event.currentTarget.dataset.itemId;
    const item = await getItem(id, "ability");

    const template = "systems/quest/templates/chat/ability-card.html";
    const html = await renderTemplate(template, item);

    const chatData = {
      event: event,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        user: game.user._id,
      },
    };

    return ChatMessage.create(chatData);
  }

  async _onDragAbilityStart(event) {
    event.stopPropagation();
    let effectId = event.currentTarget.dataset.itemId;
    let abilityId = event.currentTarget.dataset.abilityId;

    let ability = await getItem(abilityId, "ability");
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        data: {
          name: ability.name,
          item: abilityId,
          effect: effectId,
          actor: this.actor._id,
        },
      })
    );
  }

  _toggleEffectList(event) {
    const abilityId = event.currentTarget.dataset.itemId;

    let display = document.getElementById(`effects-${abilityId}`);
    let toggleOff = document.getElementById(`toggle-on-${abilityId}`);
    let toggleOn = document.getElementById(`toggle-off-${abilityId}`);

    if (display.className === "effects flexcol hide") {
      display.classList.remove("hide");
      toggleOff.classList.remove("hide");
      toggleOn.classList.add("hide");
    } else {
      display.classList.add("hide");
      toggleOff.classList.add("hide");
      toggleOn.classList.remove("hide");
    }
  }

  async _onInventoryDelete(event) {
    event.preventDefault();
    let index = event.currentTarget.dataset.index;
    let updateData = duplicate(this.actor);

    updateData.data.inventory[index].value = "";

    await this.actor.update(updateData);

    this.render(true);
    return false;
  }

  async _onSort(event) {
    event.preventDefault();
    let updateData = duplicate(this.actor);
    let inventory = updateData.data.inventory;
    let unsorted = [];
    let newInventory = [];

    for (let e = 0; e < inventory.length; e++) {
      if (inventory[e].value !== "") {
        unsorted.push(inventory[e].value);
      }
    }

    unsorted.sort();

    for (let s = 0; s < 12; s++) {
      if (unsorted[s]) {
        newInventory.push({
          value: unsorted[s],
        });
      } else {
        newInventory.push({
          value: "",
        });
      }
    }

    updateData.data.inventory = newInventory;

    await this.actor.update(updateData);

    return false;
  }

  _updateInventoryCheck(event) {
    event.preventDefault();
    let index = event.currentTarget.dataset.index;
    let timer = "timer" + index.toString();
    clearTimeout(this[timer]);

    this[timer] = setTimeout(
      async (actor) => {
        const form = new FormData(event.target.form);
        const formData = Object.fromEntries(form);
        const entries = Object.entries(formData);

        let updateData = duplicate(actor);
        let items = [];
        let newInventory = [];

        for (let e = 0; e < entries.length; e++) {
          if (entries[e][0].indexOf("inventory") > -1) {
            items.push(entries[e][1]);
          }
        }

        for (let i = 0; i < items.length; i++) {
          newInventory.push({
            value: items[i],
          });
        }

        updateData.data.inventory = newInventory;

        await actor.update(updateData);
        await this._render();
      },
      400,
      this.actor
    );
  }

  async _updateInventory(event) {
    const form = new FormData(event.target.form);
        const formData = Object.fromEntries(form);
        const entries = Object.entries(formData);

        let updateData = duplicate(this.actor);
        let items = [];
        let newInventory = [];

        for (let e = 0; e < entries.length; e++) {
          if (entries[e][0].indexOf("inventory") > -1) {
            items.push(entries[e][1]);
          }
        }

        for (let i = 0; i < items.length; i++) {
          newInventory.push({
            value: items[i],
          });
        }

        updateData.data.inventory = newInventory;

        await this.actor.update(updateData);

        return false;
  }
}
