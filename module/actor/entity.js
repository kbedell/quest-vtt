import { DiceQuest } from "../dice.js";
import { getFullAbilityData } from "../quest-helpers.js";
import { getItem } from "../quest-helpers.js";

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

    let abilityMode = game.settings.get("quest", "abilityMode");

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
      mergeObject(
        data.token,
        {
          vision: true,
          dimSight: 30,
          brightSight: 0,
          actorLink: true,
          disposition: 1,
        },
        { overwrite: false }
      );
    }
    return super.create(data, options);
  }

  // TODO: Add token - based modifications

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

  async rollGeneric(options = {}) {
    const roll = new Roll("1d20").roll();
    let isTriumph = false;
    let isSuccess = false;
    let isToughChoice = false;
    let isFailure = false;
    let isCatastrophe = false;

    if (roll.total === 20) {
      isTriumph = true;
    } else if (roll.total < 20 && roll.total >= 10) {
      isSuccess = true;
    } else if (roll.total < 11 && roll.total >= 5) {
      isToughChoice = true;
    } else if (roll.total < 6 && roll.total >= 2) {
      isFailure = true;
    } else if (roll.total === 1) {
      isCatastrophe = true;
    }

    const rollData = {
      actor: options.actor,
      roll: roll,
      isTriumph: isTriumph,
      isSuccess: isSuccess,
      isToughChoice: isToughChoice,
      isFailure: isFailure,
      isCatastrophe: isCatastrophe,
    };

    const template = "systems/quest/templates/chat/generic-card.html";
    const html = await renderTemplate(template, rollData);

    const chatData = {
      event: options.event,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: options.actor._id,
      },
    };

    // Toggle default roll mode
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode))
      chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (rollMode === "blindroll") chatData["blind"] = true;

    return ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */
  
  async rollAbility(options = {}) {
    const effect = await getItem(options.effectId, "effect");
    const ability = await getItem(options.abilityId, "ability");
    const roll = new Roll("1d20").roll();
     
    if (!effect) return;

    let resultFlavor = "";

    const ranges = effect.data.data.ranges;

    for (let r = 0; r < ranges.length; r++) {
      const range = await getItem(ranges[r], "range");

      if (range.data.data.min === range.data.data.max) {
        if (roll.total === range.data.data.max) {
          resultFlavor = TextEditor.enrichHTML(range.data.data.description.chat);
        }
      } else {
        if (roll.total <= range.data.data.max && roll.total >= range.data.data.min) {
          resultFlavor = TextEditor.enrichHTML(range.data.data.description.chat);
        }
      }
    }

    const rollData = {
      actor: options.actor,
      roll: roll,
      resultFlavor: resultFlavor,
      abilityName: ability.name
    };


    const template = "systems/quest/templates/chat/ability-roll-card.html";
    const html = await renderTemplate(template, rollData);

    const chatData = {
      event: options.event,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: options.actor._id,
      },
    };

    // Toggle default roll mode
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode))
      chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (rollMode === "blindroll") chatData["blind"] = true;

    return ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */
  /*  Chat Cards																	*/
  /* -------------------------------------------- */

  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @param {Object} htmlOptions    Options used by the TextEditor.enrichHTML function
   * @return {Object}               An object of chat data to render
   */
  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);

    // Rich text description
    data.description.value = TextEditor.enrichHTML(
      data.description.value,
      htmlOptions
    );

    return data;
  }
}
