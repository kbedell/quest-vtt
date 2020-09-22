import { ItemSheetQuest } from "./base.js";
import { EffectAdder } from "../../apps/effect-adder.js";
/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class AbilityBuilderQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 500,
      height: "auto",
      classes: ["quest", "sheet", "item", "ability-builder"],
      resizable: false,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = duplicate(this.item);
    const effects = data.data.effects;

    if (data.img === "icons/svg/mystery-man.svg") {
      data.img = "systems/quest/icons/muscle-up.png"
    }

    for (let e = 0; e < effects.length; e++) {
      let effect = effects[e];

      if (effect.name === "" || !effect.name) {
        effects.splice(e, 1);
      }
    }

    data.data.effects = effects;

    return {data: data};
  }

  /** @override */
  async _updateObject(event, formData) {
    const updateData = duplicate(this.item);

    updateData.data.name = formData.name;
    updateData.data.legendary = Boolean(formData.legendary);
    updateData.img = formData.img;
    updateData.name = formData.name;
    updateData.data.description.full = formData.full;
    updateData.data.description.chat = formData.chat;

    for (let e = 0; e < updateData.data.effects.length; e++) {
      let effect = updateData.data.effects[e];

      if (effect.name === "" || !effect.name) {
        updateData.data.effects.splice(e, 1);
      }
    }

    updateData.data.effects = updateData.data.effects;

    this.item.update(updateData);

    await this.close();

    return false;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    return "systems/quest/templates/items/ability-builder.html";
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
    
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".adder-effect").click(this._onEffectAdder.bind(this));
    html.find(".config").click(this._onEffectOpen.bind(this));
    html.find("input").change(this._updateTarget.bind(this));
    html.find("textarea").change(this._updateTarget.bind(this));
    html.find(".delete").click(this._onDeleteEffect.bind(this));
  }

  _updateTarget(event) {
    let fieldName = event.currentTarget.name;
    let value = event.currentTarget.value;

    if (fieldName === "full" || fieldName === "chat") {
      this.object.data.data.description[`${fieldName}`] = `${value}`;
    } else {
      this.object.data.data[`${fieldName}`] = `${value}`;
    }

    return false;
  }

  _onEffectAdder(event) {
    event.preventDefault();

    let effectStub = {
      name: "",
      img: "systems/quest/icons/aura.png",
      description: {
        full: "",
        chat: "",
      },
      ranges: []
    };

    this.object.data.data.effects.push(effectStub);
    
    let options = {
      effectIndex: this.object.data.data.effects.length - 1,
      abilityAppId: this.appId
    };

    new EffectAdder(this.item, options).render(true);
  }

  _onEffectOpen(event) {
    let options = {
      effectIndex: Number(event.currentTarget.closest(".effect").dataset.index),
      abilityAppId: this.appId,
    }

    new EffectAdder(this.item, options).render(true);
  }

  async _onDeleteEffect(event) {
    let index = Number(event.currentTarget.closest(".effect").dataset.index);
    let updateData = duplicate(this.object);

    updateData.data.effects.splice(index, 1);

    await this.object.update(updateData);

    return false;
  }
}
