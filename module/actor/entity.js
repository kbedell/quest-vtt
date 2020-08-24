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

  /** @override */
  async modifyTokenAttribute(attribute, value, isDelta, isBar) {
    if (attribute !== "hitpoints" || attribute !== "actionpoints")
      return super.modifyTokenAttribute(attribute, value, isDelta, isBar);

      const att = getProperty(this.data.data, attribute);
      const delta = isDelta ? value : value - current;

    if (attribute === "hitpoints") {
      const current = att.value;
      let dhp = delta - current;

      return this.update({
        "data.hitpoints.value": Math.clamped(att.value + dhp, 0, max),
      });
    } else if (attribute === "actionpoints") {
      const current = att;

      let dap = delta - current;

      return this.update({
        "data.actionpoints": Math.clamped(att.value + dhp, 0, max),
      });
    }
  }

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
    const ability = await getItem(options.abilityId, "ability");
    const effect = ability.data.data.effects[options.effectId];
    let isTriumph = false;
    let isSuccess = false;
    let isToughChoice = false;
    let isFailure = false;
    let isCatastrophe = false;

    const roll = new Roll("1d20").roll();

    if (!effect) return;

    let resultFlavor = "";

    const ranges = effect.ranges;

    for (let r = 0; r < ranges.length; r++) {
      const range = ranges[r];

      if (range.min === range.max) {
        if (roll.total === range.max) {
          resultFlavor = TextEditor.decodeHTML(
            range.description.chat
          );
        }
      } else {
        if (
          roll.total <= range.max &&
          roll.total >= range.min
        ) {
          resultFlavor = TextEditor.decodeHTML(
            range.description.chat
          );
        }
      }
    }

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
      legendary: ability.data.data.legendary,
      resultFlavor: resultFlavor,
      abilityName: ability.name,
      isTriumph: isTriumph,
      isSuccess: isSuccess,
      isToughChoice: isToughChoice,
      isFailure: isFailure,
      isCatastrophe: isCatastrophe
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
   * @param {Object} htmlOptions    Options used by the TextEditor.decodeHTML function
   * @return {Object}               An object of chat data to render
   */
  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);

    // Rich text description
    data.description.value = TextEditor.decodeHTML(
      data.description.value,
      htmlOptions
    );

    return data;
  }
}
