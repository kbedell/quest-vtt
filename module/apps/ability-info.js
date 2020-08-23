import { getItem } from "../quest-helpers.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class AbilityInfo extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "ability-info",
      classes: ["quest", "app", "ability-info"],
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
    html.find(".send-to-chat-info").click(this._onSendToChat.bind(this));
  }

  async _onSendToChat(event) {
    const id = event.currentTarget.dataset.itemId;
    const item = await getItem(id, "ability");

    const template = "systems/quest/templates/chat/ability-card.html";
    const html = await renderTemplate(template, item);

    const chatData = {
      event: event,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        user: game.user._id,
      },
    };

    return ChatMessage.create(chatData);
  }
}
