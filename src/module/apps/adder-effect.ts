import { AbilityData, AbilityItem } from '../item/ability-item';
import { EffectItem, EffectData } from '../item/effect-item';
import { GearItem } from '../item/gear-item';
import { RangeData, RangeItem, isRange } from '../item/range-item';
import { AdderRange } from './adder-range';

export class AdderEffect extends FormApplication {
  constructor(object: EffectItem, options: any) {
    super(object, options);

    this.object.apps[this.appId] = this;
  }

  get parent() {
    if (this.options.type === 'ability') {
      return game.items.get(this.options.parent) as AbilityItem;
    }

    return game.items.get(this.options.parent) as GearItem;
  }

  get type() {
    return this.options.type;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      id: `app-${_appId + 1}`,
      classes: ['quest', 'app', 'adder-effect'],
      title: game.i18n.localize('QUEST.AddEffect'),
      template: 'systems/quest/templates/apps/adder-effect.html',
      width: 496,
      height: 'auto',
      resizable: true,
      baseApplication: 'ItemSheet',
      popOut: true,
      submitOnClose: true
    });
    return options;
  }

  async getData(): Promise<EffectItem> {
    const data = duplicate(this.parent.data.data.effects[this.options.effect]);
    return data;
  }

  async _updateObject(event: any, formData: any): Promise<void> {
    event.preventDefault();
    const parentData: ItemData<AbilityData> = duplicate(this.parent.data);
    const updateData: ItemData<EffectData> = duplicate(this.parent.data.data.effects[this.options.effect]);

    if (updateData) {
      if (formData && updateData.data.description) {
        updateData.name = formData.name;
        updateData.img = formData.img;
        updateData.data.spellcost = Number(formData.spellcost);
        updateData.data.variablecost = formData.variablecost;
        updateData.data.description.full = formData['description.full'];
        updateData.data.description.chat = formData['description.chat'];
        updateData.data.ranges = updateData.data.ranges;
        if (parentData.data.effects) {
          mergeObject(this.object.data, updateData);
          parentData.data.effects[this.options.effect] = this.object;

          await this.parent.update(parentData, {});
        }
      }
    }
  }

  activateListeners(html: JQuery): void {
    html.find('.adder-range').on('click', this._onAdderRange.bind(this));
    html.find('.editor-range').on('click', this._onEditorRange.bind(this));
    html.find('.delete-range').on('click', this._onDeleteRange.bind(this));
    html.find('.image-effect').on('click', this._onImageEffect.bind(this));
  }

  async _onAdderRange(event: JQuery.ClickEvent): Promise<void> {
    event.preventDefault();
    this._updateObject(event, validateForm(this.form));

    let range: number = -1;

    let data = {
      _id: randomID(),
      name: 'New Range',
      data: {
        description: {
          full: '',
          chat: ''
        },
        min: 0,
        max: 0
      },
      type: 'range',
      flags: []
    } as RangeData;

    const stub = new RangeItem(data, {});

    let updateData: ItemData<AbilityData> = duplicate(this.parent.data);

    updateData.data.effects[this.options.effect].data.ranges.push(stub);

    await this.parent.update({ 'data.effects': updateData.data.effects }, {});

    range = updateData.data.effects[this.options.effect].data.ranges.length - 1;

    let options = {
      parent: this.parent._id,
      parentApp: this.options.parentApp,
      effectApp: this.appId,
      effect: this.options.effect,
      range: range
    };

    ui.windows[this.options.parentApp].render(false, {});
    ui.windows[this.appId].render(false, {});

    new AdderRange(stub, options).render(true);
  }

  async _onEditorRange(event: JQuery.ClickEvent) {
    event.preventDefault();

    this._updateObject(event, validateForm(this.form));
    const effectItem: ItemData<EffectData> = this.parent.data.data.effects[this.options.effect];
    let effect: number = -1;
    let range: number = -1;

    if (event.currentTarget.closest('.range') && event.currentTarget.closest('.range').dataset.index) {
      range = Number(event.currentTarget.closest('.range').dataset.index);
      effect = Number(event.currentTarget.closest('.range').dataset.effect);
    }

    for (const app of Object.values(ui.windows)) {
      if (app) {
        const data = await app.getData();

        if (data._id === effectItem.data.ranges[this.options.range]._id) {
          return;
        }
      }
    }

    for (const app of Object.values(ui.windows)) {
      if (app) {
        const data = await app.getData();

        if (data._id === effectItem.data.ranges[range]._id) {
          return;
        }
      }
    }

    let options = {
      parent: this.parent._id,
      parentApp: this.options.parentApp,
      effectApp: this.appId,
      effect: effect,
      range: range
    };

    let data = {
      _id: effectItem.data.ranges[range]._id,
      name: effectItem.data.ranges[range].name,
      data: {
        description: {
          full: effectItem.data.ranges[range].data.description.full,
          chat: effectItem.data.ranges[range].data.description.chat
        },
        min: effectItem.data.ranges[range].data.min,
        max: effectItem.data.ranges[range].data.max
      },
      type: 'range',
      flags: []
    } as RangeData;

    const temporaryRange = new RangeItem(data, { temporary: true });

    ui.windows[this.options.abilityAppId].render(false, {});
    ui.windows[this.appId].render(false, {});

    new AdderRange(temporaryRange, options).render(true);
  }

  _onImageEffect(event: JQuery.ClickEvent): Application | undefined {
    event.preventDefault;
    const hidden = document.getElementById('image-location');
    if (hidden) {
      let filePicker: FilePicker = new FilePicker({});
      filePicker.field = hidden;
      return filePicker.render(true);
    }
  }

  async _onDeleteRange(event: JQuery.ClickEvent) {
    event.preventDefault();
    const effect: number = Number(event.currentTarget.closest('.range').dataset.index);
    let updateData: ItemData<AbilityData> = duplicate(this.parent.data);

    Object.values(ui.windows).forEach(
      (app) =>
        function () {
          if (isRange(app)) {
            app.close();
          }
        }
    );

    updateData.data.effects[this.options.effect].data.ranges.splice(effect, 1);
    await this.parent.update(updateData, {});

    this.render();
    return false;
  }
}
