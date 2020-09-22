import { QuestDescription, QuestItem } from './quest-item';
import { EffectItem } from './effect-item';
export class AbilityItem extends QuestItem {
  static prepareData(): void {}

  constructor(data: AbilityData, options: any) {
    super(data, options);
    this.data = data;
  }

  data: AbilityData;
}

export interface AbilityData extends ItemData {
  description: QuestDescription;
  legendary: boolean;
  effects: Array<EffectItem>;
}
