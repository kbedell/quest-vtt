/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class RangeAdder extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "range-adder",
      classes: ["quest", "app", "range-adder"],
      title: game.i18n.localize('QUEST.AddRange'),
      template: "systems/quest/templates/apps/range-adder.html",
      width: 450,
      height: "auto",
      resizable: true,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = this.object.data.data.effects[this.options.effectIndex].ranges[this.options.rangeIndex];

    return { data: data };
  }

  /* -------------------------------------------- */

  async _updateEvent(event) {
    event.preventDefault();
    const formData = new FormData(event.target.form);
    const rangeData = Object.fromEntries(formData);

    const effects = duplicate(this.object);
    const effectIndex = this.options.effectIndex;
    const index = this.options.rangeIndex;
    const effect = effects.data.effects[effectIndex];
    let ranges = effect.ranges;

    if (
      !effects.data.effects[effectIndex].ranges[index] ||
      effects.data.effects[effectIndex].ranges[index].name === ""
    ) {
      let range = {
        name: rangeData.name,
        description: {
          full: rangeData.full,
          chat: rangeData.chat,
        },
        min: rangeData.min,
        max: rangeData.max,
      };

      ranges.push(range);
      effects.data.effects[effectIndex].ranges = ranges;
    } else {
      effects.data.effects[effectIndex].ranges[index] = {
        name: rangeData.name,
        description: {
          full: rangeData.full,
          chat: rangeData.chat,
        },
        min: rangeData.min,
        max: rangeData.max,
      };
    }

    await this.object.update(effects);
    await this.close();

    let effectWindow = window.ui.windows[`${this.options.effectAppId}`];

    if (effectWindow.length > 1 || effectWindow.length === 0) return false;

    await effectWindow.render();

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
    if (!game.user.isGM) return;

    html.find(".submit").click(this._updateEvent.bind(this));
    html.find(".cancel").click(this._cancelRangeCreation.bind(this));
  }

  async _cancelRangeCreation(event) {
    event.preventDefault();
    await this.close();
    return false;
  }
}
