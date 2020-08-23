import { getItem } from "../quest-helpers.js";

/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class RoleInfo extends FormApplication {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "role-info",
        classes: ["quest", "app", "role-info"],
        title: "Role Information",
        template: "systems/quest/templates/apps/role-info.html",
        width: 400,
        height: "auto"
      });
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      return {role: this.options};
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
      const item = await getItem(id, "role");
  
      const template = "systems/quest/templates/chat/role-card.html";
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
  