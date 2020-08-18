/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class AbilityInfo extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "ability-info",
      classes: ["quest"],
      title: "Ability Info",
      template: "systems/quest/templates/apps/ability-info.html",
      width: 400,
      height: "auto",
      choices: {},
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    return {ability: this.options};
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
    // html.find(".roll-generic").click(this._rollGeneric.bind(this));
    // html.find(".role-selector").click(this._onRolesSelector.bind(this));
    // html.find(".ability-selector").click(this._onAbilitySelector.bind(this));
  }
}
