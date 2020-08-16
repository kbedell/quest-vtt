import { DiceQuest } from "../dice.js";

/**
 * Extend the base Actor class to implement additional logic specialized for Quest.
 */
export class ActorQuest extends Actor {
    /**
     * Augment the basic actor data with additional dynamic data.
     */
    prepareData() {
        super.prepareData();

        // Get the Actor's data object
        const actorData = this.data;

        // Prepare based on actor type
        if (actorData.type === "character") this._prepareCharacterData(actorData);
        else if (actorData.type === "npc") this._prepareNPCData(actorData);
    }

    /* -------------------------------------------- */

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
      const data = actorData.data;

      data.charroles = false;
      data.quirk = false;
      data.norole = false;

      let abilityMode = game.settings.get("quest","abilityMode");

      switch (abilityMode) {
        case "quirks":
          data.charroles = true;
          data.quirk = true;
          break;
        case "dual-roles": 
          data.charroles = true;
          break;
        case "no-roles": 
          data.norole = true;
          break;
        default:
          data.charroles = true;
          break;
      }
    }

    /* -------------------------------------------- */

    /**
     * Prepare NPC type specific data
     */
    _prepareNPCData(actorData) {
      const data = actorData.data;
    }

    /* -------------------------------------------- */
    /*  Socket Listeners and Handlers
    /* -------------------------------------------- */

    /** @override */
    static async create(data, options = {}) {
    data.token = data.token || {};
    if (data.type === "character") {
      mergeObject(data.token, {
        vision: true,
        dimSight: 30,
        brightSight: 0,
        actorLink: true,
        disposition: 1
      }, { overwrite: false });
    }
    return super.create(data, options);
  }

  // TODO: Add token - based modifications

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

 /**
   * Perform a generic roll, rolling a d20
   * @return {Promise<Roll|null>}   A Promise which resolves to the Roll instance
   */
  async rollGeneric(options={}) {

    // Execute the d20 roll dialog
    const speaker = ChatMessage.getSpeaker({actor: this});
    const roll = await DiceQuest.d20Roll({
      event: options.event,
      title: `Tempting the fates:`,
      speaker: speaker,
    });
    if ( !roll ) return null;

    // Return the rolled result
    return roll;
  }

}