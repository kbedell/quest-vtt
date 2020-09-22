import { getItem } from '../helper/item-helpers';

export class InfoAbility extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;

    mergeObject(options, {
      id: 'ability-info',
      classes: ['quest', 'app', 'ability-info'],
      title: game.i18n.localize('QUEST.AbilityInfo'),
      template: 'systems/quest/templates/apps/ability-info.html',
      width: 400,
      height: 'auto'
    });

    return options;
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
    const item = await getItem(id, 'ability');

    const template = 'systems/quest/templates/chat/ability-card.html';
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
