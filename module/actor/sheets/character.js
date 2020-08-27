import { ActorSheetQuest } from "./base.js";
import { RoleSelector } from "../../apps/role-selector.js";
import { AbilitySelector } from "../../apps/ability-selector.js";
import { getItem } from "../../quest-helpers.js";
import { getAllItems } from "../../quest-helpers.js";
import { AbilityInfo } from "../../apps/ability-info.js";
import { FullAbilitySelector } from "../../apps/full-ability-selector.js";
import { GearAdder } from "../../apps/gear-adder.js";

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
      resize: true
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
    sheetdata.displayInventory = await this._getInventory(sheetdata.data.inventory);

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
    if (!game.user.isGM && this.actor.limited){
      this.options.classes.push("limited");
      this.options.width = 750;
      this.options.height = 590;

      this.position.width = 750;
      this.position.height = 590;

      return "systems/quest/templates/actors/limited-sheet.html";
    } else {
      return "systems/quest/templates/actors/character-sheet.html";
    }
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
    html.find(".ability-info").click(this._displayAbilityInfo.bind(this));

    if (!this.options.editable) return;

    if (this.actor.owner) {
      html.find(".inventory-delete").click(this._onInventoryDelete.bind(this));
      html.find(".edit-gear").click(this._onEditGear.bind(this));
      html.find(".adder-gear").click(this._onAddItem.bind(this));
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
      html
        .find(".ability-selector-quirk")
        .click(this._onAllAbilitiesSelector.bind(this));
      html
        .find(".ability-selector-all")
        .click(this._onAllAbilitiesSelector.bind(this));
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
    const roles = await getAllItems("role", false);

    let options = {
      name: "roles",
      title: game.i18n.localize('QUEST.Roles'),
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

    if (
      abilityMode === "single-role" ||
      abilityMode === "dual-roles" ||
      abilityMode === "quirks"
    ) {
      const roles = this.actor.data.data.roles;

      if (roles) {
        for (let i = 0; i < roles.length; i++) {
          let role = await getItem(roles[i], "role");
          let availablePaths = role.data.paths;

          if (!availablePaths) return;

          for (let p = 0; p < availablePaths.length; p++) {
            let path = await getItem(availablePaths[p], "path");
            let abilities = [];

            for (let a = 0; a < path.data.abilities.length; a++) {
              let abilityData = await getItem(
                path.data.abilities[a],
                "ability"
              );

              let abilityOption = {
                name: abilityData.name,
                id: abilityData._id,
                order: a,
                effects: abilityData.data.effects,
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
          let legendaries = role.data.legendaries;
          let legendaryOptions = [];

          for (let a = 0; a < legendaries.length; a++) {
            let abilityData = await getItem(legendaries[a], "ability");

            let abilityOption = {
              name: abilityData.name,
              id: abilityData._id,
              order: a,
              effects: abilityData.data.effects,
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
    }

    let options = {
      name: "abilities",
      title: game.i18n.localize('QUEST.Abilities'),
      roles: false,
      choices: choices,
    };

    new AbilitySelector(this.actor, options).render(true);
  }

  async _onAllAbilitiesSelector(event) {
    event.preventDefault();
    let choices = [];
    const abilityMode = game.settings.get("quest", "abilityMode");

    if (abilityMode === "quirks" || abilityMode === "no-roles" || abilityMode === "no-masters" ) {
      const roles = await getAllItems("role", false);

      if (!roles) return false;

      for (let r = 0; r < roles.length; r++) {
        let paths = roles[r].data.paths;
        let pathData = [];

        for (let p = 0; p < paths.length; p++) {
          let path = await getItem(paths[p], "path");

          let abilityList = path.data.abilities;
          let abilities = [];

          for (let a = 0; a < abilityList.length; a++) {
            let abilityData = await getItem(abilityList[a], "ability");

            abilities.push({
              name: abilityData.name,
              id: abilityData._id,
              order: a,
              effects: abilityData.data.effects,
            });
          }

          pathData.push({
            name: path.name,
            id: path._id,
            abilities: abilities,
          });
        }

        let legendaries = roles[r].data.legendaries;
        let legendaryOptions = [];

        for (let l = 0; l < legendaries.length; l++) {
          let legendaryData = await getItem(legendaries[l], "ability");

          legendaryOptions.push({
            name: legendaryData.name,
            id: legendaryData._id,
            order: l,
            effects: legendaryData.data.effects,
          });
        }

        choices.push({
          role: roles[r].name,
          id: roles[r]._id,
          paths: pathData,
          legendaries: legendaryOptions,
        });
      }
    }

    let options = {
      name: "abilities",
      title: game.i18n.localize('QUEST.Abilities'),
      roles: true,
      mode: abilityMode,
      choices: choices,
    };

    new FullAbilitySelector(this.actor, options).render(true);
  }

  async _getRoles(roles) {
    let roleData = [];

    for (let r = 0; r < roles.length; r++) {
      let role = {};
      let roleId = roles[r];

      role = await getItem(roleId, "role");

      if (!role) continue;

      roleData.push({
        name: role.name,
        id: role._id,
      });
    }

    return roleData;
  }

  async _getAbilities(abilities) {
    let abilityData = [];

    let fullList = abilities.concat(this.actor.data.data.quirks);

    for (let a = 0; a < fullList.length; a++) {
      let ability = {};
      let abilityId = fullList[a];
      let roll = false;
      let multi = false;
      let cost = "0";

      ability = await getItem(abilityId, "ability");

      let effects = ability.data.effects;
      let effectData = [];

      if (effects.length === 0) {
        effectData.push({
          name: ability.name,
          id: null,
          roll: false,
          cost: "0",
          variablecost: false,
        });
      } else {
        for (let e = 0; e < effects.length; e++) {
          let effect = effects[e];
          let spellcost = "0";

          if (effect.ranges.length > 0) {
            roll = true;
          }

          if (effect.variablecost) {
            spellcost = "x";
          } else {
            spellcost = effect.spellcost;
          }
  
          effectData.push({
            name: effect.name,
            id: e,
            roll: roll,
            cost: spellcost,
            variablecost: Boolean(effect.variablecost),
          });
        }
  
        if (!ability) continue;
  
        if (effectData.length > 1) {
          cost = "x";
          multi = true;
        } else if (effectData.length === 1) {
          if (
            !effectData[0].variablecost &&
            effectData[0].cost != "" &&
            parseInt(effectData[0].cost) >= 0
          ) {
            cost = effectData[0].cost;
          } else {
            cost = "x";
          }
        }
      }

      abilityData.push({
        name: ability.name,
        id: ability._id,
        cost: cost,
        multi: multi,
        effects: effectData,
      });
    }

    abilityData.sort(this.compareAbilityNames);

    return abilityData;
  }

  async _getInventory(inventory) {
    let display = [];

    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].association) {
        let item = this.actor.getEmbeddedEntity("OwnedItem", inventory[i].value, true);

        display.push({
          name: item.name,
          association: true,
          id: item._id
        });
      } else {
        display.push({
          name: inventory[i].value,
          association: false
        });
      }
    }

    return display;
  }

  async _displayAbilityInfo(event) {
    event.preventDefault();
    let options = {};
    let effectsText = [];

    let ability = await getItem(
      event.target.parentNode.dataset.itemId,
      "ability"
    );

    if (ability.data.effects.length > 0) {
      let effects = ability.data.effects;

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
          description: TextEditor.decodeHTML(effects[e].description.full),
          cost: cost,
          ranges: rangeText,
          roll: roll,
        });
      }
    }

    options = {
      name: ability.name,
      id: ability._id,
      legendary: ability.data.legendary,
      description: TextEditor.decodeHTML(ability.data.description.full),
      effects: effectsText,
    };

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
    let effectId = event.currentTarget.dataset.itemId;
    let abilityId = event.currentTarget.dataset.abilityId;
    let name = event.currentTarget.dataset.abilityName;

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        data: {
          name: name,
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

    if (display.className === "effects effects-expand flexcol hide") {
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

    if (this.actor.data.data.inventory[index].association) {
      await this.actor.deleteEmbeddedEntity("OwnedItem", this.actor.data.data.inventory[index].value);
    }

    let updateData = duplicate(this.actor);

    updateData.data.inventory[index].value = "";
    updateData.data.inventory[index].association = false;

    await this.actor.update(updateData);
    
    return false;
  }

  async _onSort(event) {
    event.preventDefault();
    let updateData = duplicate(this.actor);
    let inventory = updateData.data.inventory;
    const limit = game.settings.get("quest", "inventorySize");
    let unsorted = [];
    let newInventory = [];

    for (let e = 0; e < inventory.length; e++) {
      if (inventory[e].association) {
        let gear = this.actor.getEmbeddedEntity("OwnedItem", inventory[e].value, true);
        unsorted.push(gear.name);
      } else {
        if (inventory[e].value !== "") {
          unsorted.push(inventory[e].value);
        }
      }
    }

    unsorted.sort();

    for (let s = 0; s < limit; s++) {
      let entry = inventory.find((item) => item.value === unsorted[s]);

      if (entry) {
        newInventory.push(duplicate(entry));
      } else {
        entry = this.actor.items.find((i) => i.data.name === unsorted[s]);

        if (entry) {
          newInventory.push({
            value: entry.data._id,
            association: true
          });
        } else {
          newInventory.push({
            value: "",
            association: false
          });
        }
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
        let newInventory = [];

        for (let g = 0; g < updateData.data.inventory.length; g++) {
          if (updateData.data.inventory[g].association) {
            newInventory.push({
              value: updateData.data.inventory[g].value,
              association: updateData.data.inventory[g].association,
            });
          } else {
            let entry = entries.find((item) => item[0] === `inventory-${g}`);
              newInventory.push({
                value: entry[1],
                association: false
            });
          }
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
    let newInventory = [];

    for (let g = 0; g < updateData.data.inventory.length; g++) {
      if (updateData.data.inventory[g].association) {
        newInventory.push({
          value: updateData.data.inventory[g].value,
          association: updateData.data.inventory[g].association,
        });
      } else {
        let entry = entries.find((item) => item[0] === `inventory-${g}`);
          newInventory.push({
            value: entry[1],
            association: false
        });
      }
    }

    updateData.data.inventory = newInventory;

    await this.actor.update(updateData);

    return false;
  }

  compareAbilityNames(a, b) {
    const objectA = a.name.toLowerCase();
    const objectB = b.name.toLowerCase();
  
    let comparison = 0;
    if (objectA > objectB) {
      comparison = 1;
    } else if (objectA < objectB) {
      comparison = -1;
    }
    return comparison;
  }

  async _onAddItem(event) {
    event.preventDefault();
    let index = event.currentTarget.dataset.index;
    let unfiltered = [];

    const gear = await getAllItems("gear", true);

    const filtered = gear.filter((item) => !item.data.gmonly);

    let options = {
      name: "add-gear",
      title: game.i18n.localize('QUEST.AddGear'),
      choices: filtered,
      index: index
    };

    new GearAdder(this.actor, options).render(true);
  }

  _onEditGear(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const id = this.actor.data.data.inventory[index].value;
    const gear = this.actor.items.find((i) => i.data._id == id);

    if (!gear) return;

    gear.sheet.render(true);
  }
}
