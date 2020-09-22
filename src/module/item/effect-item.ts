import { QuestDescription } from './quest-item';
import { RangeItem } from '../item/range-item';

export class EffectItem extends Item {
  static prepareData(): void {}

  constructor(data: EffectData, options: any) {
    super(data, options);
    this.data = data;
    this.flags = [];
  }

  data: EffectData;
  flags: Array<any>;
}

export interface EffectData extends ItemData {
  _id: string;
  name: string;
  img: string;
  description: QuestDescription;
  spellcost: number;
  variablecost: boolean;
  ranges: Array<RangeItem>;
}

export function isEffect(data: any): data is EffectData {
  return (data as EffectData).ranges !== undefined;
}
