import { QuestItem } from './item/quest-item';
import { AbilityItem } from './item/ability-item';
import { PathItem } from './item/path-item';
import { RoleItem } from './item/role-item';
import { GearItem } from './item/gear-item';
import { QuestActor } from './actor/quest-actor';
import { CharacterActor } from './actor/character-actor';

export interface QuestConfig {
  items: {
    [index: string]: typeof QuestItem;
  };

  actors: {
    [index: string]: typeof QuestActor;
  };

  rarities: {
    [index: string]: string;
  };
}

export const QUEST: QuestConfig = {
  items: {
    ability: AbilityItem as any,
    path: PathItem as any,
    role: RoleItem as any,
    gear: GearItem as any
  },

  actors: {
    character: CharacterActor as any
  },

  rarities: {
    common: 'QUEST.RarityCommon',
    uncommon: 'QUEST.RarityUncommon',
    rare: 'QUEST.RarityRare',
    legendary: 'QUEST.RarityLegendary',
    supreme: 'QUEST.RaritySupreme',
    custom: 'QUEST.RarityCustom'
  }
};
