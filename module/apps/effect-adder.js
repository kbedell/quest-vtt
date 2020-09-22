import { RangeAdder } from "./range-adder.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class EffectAdder extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "effect-adder",
      classes: ["quest", "app", "effect-adder"],
      title: game.i18n.localize('QUEST.AddEffect'),
      template: "systems/quest/templates/apps/effect-adder.html",
      width: 500,
      height: "auto",
      resizable: true,
      data: {},
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = this.object.data.data.effects[this.options.effectIndex];

    for (let r = 0; r < data.ranges.length; r++) {
      let range = data.ranges[r];

      if (range.name === "" || !range.name) {
        data.ranges.splice(r, 1);
      }
    }

    return { data: data };
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateAbility(event) {
    event.preventDefault();
    const formData = new FormData(event.target.form);
    const effectData = Object.fromEntries(formData);
    const index = this.options.effectIndex;
    const ability = duplicate(this.object);

    if (
      !ability.data.effects[index] ||
      ability.data.effects[index].name === ""
    ) {
      let effect = {
        name: effectData.name,
        description: {
          full: effectData.full,
          chat: effectData.chat,
        },
        spellcost: effectData.spellcost,
        variablecost: effectData.variablecost,
        img: effectData.img,
        ranges: ability.data.effects[index].ranges
      };

      ability.data.effects.push(effect);
    } else {
      ability.data.effects[index] = {
        name: effectData.name,
        description: {
          full: effectData.full,
          chat: effectData.chat,
        },
        spellcost: effectData.spellcost,
        variablecost: effectData.variablecost,
        img: effectData.img,
        ranges: ability.data.effects[index].ranges
      };
    }

    await this.object.update(ability);

    await this.close();

    let abilityWindow = window.ui.windows[`${this.options.abilityAppId}`];

    if (abilityWindow.length > 1 || abilityWindow.length === 0) return false;

    await abilityWindow.render();

    return false;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    if (!this.options.editable) return;

    html.find(".adder-range").click(this._onRangeAdder.bind(this));
    html.find(".submit").click(this._updateAbility.bind(this));
    html.find("input").change(this._updateTarget.bind(this));
    html.find("textarea").change(this._updateTarget.bind(this));
    html.find(".cancel").click(this._onCancelEffect.bind(this));
    html.find(".item-image").click(this._onImageSelector.bind(this));
    html.find("#image-value").change(this._reRenderImage.bind(this));
    html.find(".config").click(this._onRangeOpen.bind(this));
  }

  _updateTarget(event) {
    let fieldName = event.currentTarget.name;
    let value = event.currentTarget.value;
    const index = this.options.effectIndex;

    if (fieldName === "full" || fieldName === "chat") {
      this.object.data.data.effects[index].description[
        `${fieldName}`
      ] = `${value}`;
    } else {
      this.object.data.data.effects[index][`${fieldName}`] = `${value}`;
    }

    return false;
  }

  _onRangeAdder(event) {
    event.preventDefault();

    let options = {
      effectAppId: this.appId,
      effectIndex: this.options.effectIndex,
    };

    new RangeAdder(this.object, options).render(true);
  }

  async _onCancelEffect(event) {
    event.preventDefault();
    await this.close();
    return false;
  }

  _onImageSelector(event) {
    let hidden = document.getElementById("image-value");
    let filepicker = new FilePicker();
    filepicker.field = hidden;
    return filepicker.render();
  }

  async _reRenderImage(event) {
    const index = this.options.effectIndex;
    let hidden = document.getElementById("image-value");

    const updateData = duplicate(this.object);
    updateData.data.effects[index].img = hidden.value;

    await this.object.update(updateData);
    this.render();

    return false;
  }

  _onRangeOpen(event) {
    let options = {
      effectIndex: this.options.effectIndex,
      rangeIndex: Number(event.currentTarget.closest(".range").dataset.index),
      effectAppId: this.appId
    };

    new RangeAdder(this.object, options).render(true);
  }
}
