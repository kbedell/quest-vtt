import {ActorSheetQuest} from "./base.js";

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
      height: 690
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
    if ( !game.user.isGM && this.actor.limited ) return "systems/quest/templates/actors/limited-sheet.html";
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

    html.find('.roll-generic').click(this._rollGeneric.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling a generic for the Character
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _rollGeneric(event) {
    event.preventDefault();
    return this.actor.rollGeneric({event: event});
  }
}
