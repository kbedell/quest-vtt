import { ItemSheetQuest } from './item-sheet-quest';
import { AbilityData } from '../ability-item';
import { EffectData, EffectItem, isEffect } from '../effect-item';
import { AdderEffect } from '../../apps/adder-effect';

export class AbilityItemSheet extends ItemSheetQuest {
  static get defaultOptions(): FormApplicationOptions {
    const options = super.defaultOptions;

    mergeObject(options, {
      width: 496,
      height: 'auto',
      classes: ['quest', 'sheet', 'item', 'ability'],
      submitOnClose: true,
      resizable: false
    });

    return options;
  }

  getData(): AbilityData {
    let data = super.getData() as AbilityData;

    return data;
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    if (!game.user.isGM) return;

    html.find('.adder-effect').on('click', this._onAdderEffect.bind(this));
    html.find('.editor-effect').on('click', this._onEditorEffect.bind(this));
    html.find('.delete-effect').on('click', this._onDeleteEffect.bind(this));
  }

  async _onAdderEffect(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();

    const ability: ItemData<AbilityData> = this.item.data;
    let effect: number = -1;

    let data = {
      _id: randomID(),
      name: 'New Effect',
      img: 'systems/quest/assets/icons/symbol_effect_small.svg',
      data: {
        description: {
          full: '',
          chat: ''
        },
        spellcost: 0,
        variablecost: false,
        ranges: []
      },
      type: 'effect',
      flags: []
    } as EffectData;

    const stub = new EffectItem(data, {});

    let updateData: ItemData<AbilityData> = duplicate(ability);

    updateData.data.effects.push(stub);
    await this.item.update({ 'data.effects': updateData.data.effects }, {});

    effect = updateData.data.effects.length - 1;

    let options = {
      type: 'ability',
      parent: this.item._id,
      parentApp: this.appId,
      effect: effect
    };

    new AdderEffect(stub, options).render(true);
  }

  async _onEditorEffect(event: JQuery.ClickEvent) {
    event.preventDefault();

    const ability: ItemData<AbilityData> = this.item.data;
    let effect: number = -1;

    if (event.currentTarget.closest('.effect') && event.currentTarget.closest('.effect').dataset.index) {
      effect = Number(event.currentTarget.closest('.effect').dataset.index);
    }

    for (const app of Object.values(ui.windows)) {
      if (app) {
        const data = await app.getData();

        if (data._id === ability.data.effects[effect]._id) {
          return;
        }
      }
    }

    let options = {
      type: 'ability',
      parent: this.item._id,
      parentApp: this.appId,
      effect: effect
    };

    let data = {
      _id: ability.data.effects[effect]._id,
      name: ability.data.effects[effect].name,
      img: ability.data.effects[effect].img,
      data: {
        description: {
          full: ability.data.effects[effect].data.description.full,
          chat: ability.data.effects[effect].data.description.chat
        },
        spellcost: ability.data.effects[effect].data.spellcost,
        variablecost: ability.data.effects[effect].data.variablecost,
        ranges: ability.data.effects[effect].data.ranges
      },
      type: 'effect',
      flags: []
    } as EffectData;

    const temporaryEffect = new EffectItem(data, { temporary: true });

    new AdderEffect(temporaryEffect, options).render(true);
  }

  async _onDeleteEffect(event: JQuery.ClickEvent) {
    event.preventDefault();
    const effect: number = Number(event.currentTarget.closest('.effect').dataset.index);
    let updateData: ItemData<AbilityData> = duplicate(this.item.data);

    Object.values(ui.windows).forEach(
      (app) =>
        function () {
          if (isEffect(app)) {
            app.close();
          }
        }
    );

    if (updateData.data.effects) {
      updateData.data.effects.splice(effect, 1);
      await this.item.update(updateData, {});
    }

    this.render();

    return false;
  }
}
