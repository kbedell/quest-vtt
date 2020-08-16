import { ActorSheetQuest } from "./base.js";
import { RoleSelector } from "../../apps/role-selector.js";
import { AbilitySelector } from "../../apps/ability-selector.js";
import { getItem } from "../../quest-helpers.js";

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

    // html.find(".ability-delete").click(this._onDeleteAbility.bind(this));

    this.form.ondragover = (ev) => this._onDragOver(ev);
    this.form.ondrop = (ev) => this._onDrop(ev);
    this.form.ondragenter = (ev) => this._onDragEnter(ev);
    this.form.ondragleave = (ev) => this._onDragLeave(ev);

    document.addEventListener("dragend", this._onDragEnd.bind(this));
  }

  /* -------------------------------------------- */

  async _onDragStart(event) {
    event.stopPropagation();
    const itemId = Number(event.currentTarget.dataset.itemId);
    let item = items.find((i) => i._id === itemId);
    item = duplicate(item);
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        data: item,
      })
    );
  }

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (!this.actor) return;

      if (data.pack) {
        if (data.pack === "world.abilities") {
          let pack = game.packs.find((p) => p.collection === data.pack);
          role = await pack.getEntity(data.id);
          let updateData = duplciate(this.actor.data);
          updateData.abilities.push(data);
          await this.actor.update(updateData);
        }
      } else {
        let role = game.items.get(data.id);
        if (range.data.type === "role") {
          let updateData = duplciate(this.actor.data);
          updateData.abilities.push(data);
          await this.actor.update(updateData);
        }
      }

      event.target.classList.remove("hover");
      return false;
    } catch (err) {
      console.log("Quest abilities | drop error");
      console.log(event.dataTransfer.getData("text/plain"));
      console.log(err);
      return false;
    }
  }

  _onDragEnd(event) {
    event.preventDefault();
    return false;
  }
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  _onDragEnter(event) {
    event.preventDefault();
    if (event.target.className === "adder") {
      event.target.classList.add("hover");
    }
    return false;
  }

  _onDragLeave(event) {
    event.preventDefault();
    if (event.target.className === "adder hover") {
      event.target.classList.remove("hover");
    }
    return false;
  }

  // async _onDeleteItem(event) {
  //   event.preventDefault();

  //   let updateData = duplicate(this.item.data);
  //   const rangeId = Number(event.currentTarget.closest(".item").dataset.itemId);
  //   updateData.data.ranges.splice(rangeId, 1);

  //   await this.item.update(updateData);
  //   this.render(true);
  //   return false;
  // }

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
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  async _onRolesSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");
    let abilities = [];
    let finalabilities = [];

    let pack = game.packs.find((p) => p.collection === a.dataset.options);

    if (pack) {
      const items = await pack.getData();
      for (let h = 0; h < items.index.length; h++) {
        let item = await pack.getEntity(items.index[i]._id);
        if (item.data.type === "role") {
          abilities.push(item.data);
        }
      }
    }

    const gameItems = game.items.entities;

    for (let i = 0; i < gameItems.length; i++) {
      if (gameItems[i].data.type === "role") {
        abilities.push(gameItems[i].data);
      }
    }

    let tracker = [];
    for (let j = 0; j < abilities.length; j++) {
      if (abilities[j].pack && !tracker.includes(abilities[j].name)) {
        finalabilities.push(abilities[j]);
      } else if (!tracker.includes(abilities[j].name)) {
        finalabilities.push(abilities[j]);
      }
    }

    let options = {
      name: "roles",
      title: "Role(s)",
      choices: finalabilities
    };

    new RoleSelector(this.actor, options).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  async _onAbilitySelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");
    const abilityMode = game.settings.get("quest", "abilityMode");
    const roles = this.actor.data.data.roles;
    const choices = [];

    if (abilityMode === "single-role" || abilityMode === "dual-roles") {
      if (roles) {
        for (let i = 0; i < roles.length; i++)  {
          let availablePaths = roles[i].data.paths;

          if (!availablePaths) return;
          
          for (let p = 0; p < availablePaths.length; p++) {
            let path = await getItem(availablePaths[i].id, "path");
            let abilityOption = {};

            for (let a = 0; a < path.data.abilities.length; a++) {
              let abilityData = await getItem(path.data.abilities[i].id, "ability");
              

              abilityOption = {
                name: abilityData.name,
                id: abilityData._id,
                order: a
              };
            }

            choices.push({
              name: path.name,
              abilities: abilityOption
            });
          }
        }
      }
    } else if (abilityMode === "quirks" || abilityMode === "no-roles") {
      console.log("not ready yet");
    }

    let options = {
      name: "abilities",
      title: "Abilities",
      choices: choices
    };

    console.log(options);

    new AbilitySelector(this.actor, options).render(true);
  }
}
