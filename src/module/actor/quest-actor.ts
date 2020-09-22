import { getItem } from '../helper/item-helpers';

export class QuestActor extends Actor {
  prepareData() {
    super.prepareData();
    const actorData = this.data;
    // Prepare based on actor type
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }
  _prepareCharacterData(actorData: any) {
    const data = actorData.data;
    data.roles = false;
    data.quirk = false;
    const abilityMode = game.settings.get('quest', 'abilityMode');
    switch (abilityMode) {
      case 'quirks':
        data.roles = true;
        data.quirk = true;
        break;
      case 'dual-roles':
        data.roles = true;
        break;
      case 'no-roles':
        break;
      case 'no-masters':
        break;
      default:
        data.roles = true;
        break;
    }
  }
}
