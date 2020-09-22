import { QuestDescription } from './quest-item';

export class RangeItem extends Item {
  static prepareData(): void {}

  constructor(data: RangeData, options: any) {
    super(data, options);
    this.data = data;
  }

  data: RangeData;
}

export interface RangeData extends ItemData {
  _id: string;
  name: string;
  description: QuestDescription;
  min: number;
  max: number;
}

export function isRange(data: any): data is RangeData {
  return (data as RangeData).min !== undefined;
}
