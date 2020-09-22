import { AbilityData, AbilityItem } from '../item/ability-item';
import { EffectItem } from '../item/effect-item';
import { GearItem } from '../item/gear-item';
import { RangeItem, RangeData } from '../item/range-item';

export class AdderRange extends FormApplication {
  constructor(object: RangeItem, options: any) {
    super(object, options);

    this.object.apps[this.appId] = this;
  }

  get parent() {
    if (this.options.type === 'ability') {
      return game.items.get(this.options.parent) as AbilityItem;
    }

    return game.items.get(this.options.parent) as GearItem;
  }

  get effect() {
    return this.parent.data.data.effects[this.options.effect] as EffectItem;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      id: `app-${_appId + 1}`,
      classes: ['quest', 'app', 'adder-range'],
      title: game.i18n.localize('QUEST.AddRange'),
      template: 'systems/quest/templates/apps/adder-range.html',
      width: 448,
      height: 'auto',
      resizable: true,
      baseApplication: 'ItemSheet',
      popOut: true,
      submitOnClose: true
    });

    return options;
  }

  async getData(): Promise<RangeItem> {
    const data = duplicate(this.effect.data.ranges[this.options.range]);
    return data;
  }

  async _updateObject(event: any, formData: any): Promise<void> {
    event.preventDefault();
    const abilityData: ItemData<AbilityData> = duplicate(this.parent.data);
    const updateData: ItemData<RangeData> = duplicate(this.object.data);

    updateData.name = formData.name;
    updateData.data.min = Number(formData.min);
    updateData.data.max = Number(formData.max);
    updateData.data.description.full = formData['description.full'];
    updateData.data.description.chat = formData['description.chat'];
    mergeObject(this.object.data, updateData);
    abilityData.data.effects[this.options.effect].data.ranges[this.options.range] = this.object;

    await this.parent.update(abilityData, {});

    ui.windows[this.options.parentApp].render(false, {});
    ui.windows[this.options.effectApp].render(false, {});
  }
}
