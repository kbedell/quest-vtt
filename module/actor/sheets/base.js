/**
 * Extend the basic ActorSheet class to do all the Quest things!
 * This sheet is an Abstract layer which is not used.
 *
 * @type {ActorSheet}
 */
export class ActorSheetQuest extends ActorSheet {
  constructor(...args) {
    super(...args);
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "inventory",
        },
      ],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Basic data
    let isOwner = this.entity.owner;
    const data = {
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked",
      isCharacter: this.entity.data.type === "character",
      isNPC: this.entity.data.type === "npc",
      config: CONFIG.QUEST,
    };

    // The Actor and its Items
    data.actor = duplicate(this.actor.data);
    data.data = data.actor.data;

    // Return data to the sheet
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

 /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    // Editable Only Listeners
    if ( this.isEditable ) {

      // Relative updates for numeric fields
      html.find('input[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));
    }

    super.activateListeners(html);
  }

  /**
   * Handle input changes to numeric form fields, allowing them to accept delta-typed inputs
   * @param event
   * @private
   */
  _onChangeInputDelta(event) {
    const input = event.target;
    const value = input.value;
    if (["+", "-"].includes(value[0])) {
      let delta = parseFloat(value);
      input.value = getProperty(this.actor.data, input.name) + delta;
    } else if (value[0] === "=") {
      input.value = value.slice(1);
    }
  }

    /* -------------------------------------------- */
}
