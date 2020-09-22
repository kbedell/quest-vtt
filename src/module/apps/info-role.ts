import { getItem } from '../helper/item-helpers';

export class InfoRole extends FormApplication {
  static get defaultOptions() {
    const option = super.defaultOptions;

    mergeObject(option, {
      id: 'role-info',
      classes: ['quest', 'app', 'role-info'],
      title: game.i18n.localize('QUEST.RoleInfo'),
      template: 'systems/quest/templates/apps/role-info.html',
      width: 400,
      height: 'auto'
    });

    return option;
  }

  getData() {
    const data = this.options;

    return data;
  }

  activateListeners(html: JQuery) {
    html.find('.send-to-chat-info').click(this._onSendToChat.bind(this));
  }

  async _onSendToChat(event: JQuery.ClickEvent) {
    const id = event.currentTarget.dataset.id;
    const item = await getItem(id, 'role');

    const template = 'systems/quest/templates/chat/role-card.html';
    const html = await renderTemplate(template, item);

    const chatData = {
      event: event,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        user: game.user._id
      }
    };

    return ChatMessage.create(chatData);
  }
}
