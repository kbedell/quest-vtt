import { QuestItem } from './quest-item';
import { AbilityItem } from './ability-item';
import { PathItem } from './path-item';

export class RoleItem extends QuestItem {
  static prepareData(): void {}

  constructor(data: ItemData<RoleData>, options: any) {
    super(data, options);
    this.data = data;
  }

  data: RoleData;
}

export interface RoleData extends ItemData {
  description?: {
    full: '';
    chat: '';
  };
  paths?: Array<string>;
  legendaries?: Array<string>;
  displayPaths?: Array<PathItem>;
  displayLegendaries?: Array<AbilityItem>;
}
