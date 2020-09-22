import { QuestItem, QuestItemData } from './quest-item';
import { EffectItem } from './effect-item';

export class GearItem extends QuestItem {
  static prepareData(): void {}

  constructor(data: GearData, options: any) {
    super(data, options);
    this.data = data;
  }

  data: GearData;
}

export interface GearData extends QuestItemData {
  rarity: rarity;
  damage: number;
  activationcost: number;
  variablecost: boolean;
  gmonly: boolean;
  effects: Array<EffectItem>;
  abilities: Array<string>;
  notes: string;
}

export interface rarity {
  value: string;
  custom: string;
}
