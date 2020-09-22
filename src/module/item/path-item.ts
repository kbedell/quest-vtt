import { QuestItem } from './quest-item';
import { AbilityItem } from './ability-item';

export class PathItem extends QuestItem {
  static prepareData(): void {}

  constructor(data: ItemData<PathData>, options: any) {
    super(data, options);
    this.data = data;
  }

  data: PathData;
}

export interface PathData extends ItemData {
  abilities?: Array<string>;
  displayAbilities?: Array<AbilityItem>;
}
