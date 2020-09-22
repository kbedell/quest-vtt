export class QuestItem extends Item {
  prepareData(): void {
    super.prepareData();
    const data = this.data;

    CONFIG.QUEST.items[data.type].prepareData();
  }
}

export interface QuestItemData extends ItemData {
  description?: QuestDescription;
}

export interface QuestDescription {
  chat: string;
  full: string;
}
