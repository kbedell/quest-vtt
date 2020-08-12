/**
 * Extend the base Actor class to implement additional logic specialized for Quest.
 */
export class CharacterQuest extends Actor {
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

}