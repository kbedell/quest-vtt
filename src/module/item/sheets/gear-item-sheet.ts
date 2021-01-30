import { ItemSheetQuest } from './item-sheet-quest';
import { GearData, rarity } from '../gear-item';
import { AdderEffect } from '../../apps/adder-effect';
import { EffectData, EffectItem, isEffect } from '../effect-item';
import { CloseSelector, ShowCloseSelector, UpdateSelector } from '../../helper/custom-selector-helper';

export class GearItemSheet extends ItemSheetQuest {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 496,
      height: 'auto',
      classes: ['quest', 'sheet', 'item', 'gear'],
      submitOnClose: true,
      resizable: true
    });
  }

  getData(): GearSheetData {
    let data = super.getData() as GearSheetData;

    data.rarities = this._getRarities(data.data.rarity) as Rarities;
    data.selected = this._getSelectedRarity(data.rarities);

    return data;
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    if (!this.options.editable) return;

    html.find('.adder-effect').on('click', this._onAdderEffect.bind(this));
    html.find('.editor-effect').on('click', this._onEditorEffect.bind(this));
    html.find('.delete-effect').on('click', this._onDeleteEffect.bind(this));
    html.find('.selector-selected').on('click', ShowCloseSelector.bind(this));
    html.find('.selector-item').on('click', UpdateSelector.bind(this));
    html.on('click', CloseSelector.bind(this));
  }

  _getRarities(rarity: rarity) {
    const rarities = CONFIG.QUEST.rarities;
    let display = [];

    for (let [k, v] of Object.entries(rarities)) {
      display.push({
        selected: rarity ? rarity.value === k : false,
        value: k,
        display: v
      });
    }

    return {
      choices: display,
      custom: rarity ? rarity.custom : ''
    };
  }

  _getSelectedRarity(rarities: Rarities) {
    if (rarities.custom != '') {
      return rarities.custom;
    }

    for (let c = 0; c < rarities.choices.length; c++) {
      if (rarities.choices[c].selected) {
        return rarities.choices[c].display;
      }
    }
  }

  async _onAdderEffect(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();

    const gear: ItemData<GearData> = this.item.data;
    let effect: number = -1;

    let data = {
      _id: randomID(),
      name: 'New Effect',
      img: 'systems/quest/assets/symbols/symbol_effect_small.svg',
      data: {
        description: {
          full: null,
          chat: null
        },
        spellcost: null,
        variablecost: false,
        ranges: []
      },
      type: 'effect',
      flags: []
    } as EffectData;

    const stub = new EffectItem(data, {});

    let updateData: ItemData<GearData> = duplicate(gear);

    updateData.data.effects.push(stub);
    await this.item.update({ 'data.effects': updateData.data.effects }, {});

    effect = updateData.data.effects.length - 1;

    let options = {
      type: 'gear',
      parent: this.item._id,
      parentApp: this.appId,
      effect: effect
    };

    new AdderEffect(stub, options).render(true);
  }

  async _onEditorEffect(event: JQuery.ClickEvent) {
    event.preventDefault();

    const gear: ItemData<GearData> = this.item.data;
    let effect: number = -1;

    if (event.currentTarget.closest('.effect') && event.currentTarget.closest('.effect').dataset.index) {
      effect = Number(event.currentTarget.closest('.effect').dataset.index);
    }

    for (const app of Object.values(ui.windows)) {
      if (app) {
        const data = await app.getData();

        if (data._id === gear.data.effects[effect]._id) {
          return;
        }
      }
    }

    let options = {
      type: 'gear',
      parent: this.item._id,
      parentApp: this.appId,
      effect: effect
    };

    let data = {
      _id: gear.data.effects[effect]._id,
      name: gear.data.effects[effect].name,
      img: gear.data.effects[effect].img,
      data: {
        description: {
          full: gear.data.effects[effect].data.description.full,
          chat: gear.data.effects[effect].data.description.chat
        },
        spellcost: gear.data.effects[effect].data.spellcost,
        variablecost: gear.data.effects[effect].data.variablecost,
        ranges: gear.data.effects[effect].data.ranges
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
    let updateData: ItemData<GearData> = duplicate(this.item.data);

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

interface GearSheetData extends ItemSheetData {
  rarities?: Rarities;
  selected?: string;
}

interface Rarities {
  choices: Array<RarityDisplay>;
  custom: string;
}

interface RarityDisplay {
  selected: boolean;
  value: string;
  display: string;
}
