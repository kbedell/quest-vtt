import { ItemSheetQuest } from './item-sheet-quest';
import { AbilityData, AbilityItem } from '../ability-item';
import { RoleData, RoleItem } from '../role-item';
import { PathItem } from '../path-item';
import { getItem, getAllItems } from '../../helper/item-helpers';
import { autocomplete } from '../../helper/autocomplete-helper';

export class RoleItemSheet extends ItemSheetQuest {
  static get defaultOptions() {
    const options = super.defaultOptions;

    mergeObject(options, {
      width: 560,
      height: 420,
      classes: ['quest', 'sheet', 'item', 'role'],
      resizable: true
    });

    return options;
  }

  async getData(): Promise<RoleSheetData> {
    let data = super.getData() as RoleSheetData;

    data.legendaries = await this._getLegendaries(data.data.legendaries);
    data.paths = await this._getPaths(data.data.paths);

    return data;
  }

  async activateListeners(html: JQuery) {
    super.activateListeners(html);

    if (!this.options.editable) return;
    if (!game.user.isGM) return;

    const paths = await getAllItems('path', false);
    let optionsPaths = {
      data: paths,
      input: document.getElementById('filter-paths'),
      autocomplete: document.getElementById('autocomplete-paths'),
      type: 'path',
      object: this.object
    };

    autocomplete(optionsPaths);

    const abilities = await getAllItems('ability', true);
    const legendaries = abilities.filter((ability: AbilityData) => ability.data.legendary);
    let optionsLegendaries = {
      data: legendaries,
      input: document.getElementById('filter-abilities'),
      autocomplete: document.getElementById('autocomplete-abilities'),
      type: 'legendary',
      object: this.object
    };

    autocomplete(optionsLegendaries);

    html.find('.delete-ability').click(this._onDeleteLegendary.bind(this));
    html.find('.delete-path').click(this._onDeletePath.bind(this));
  }

  async _getPaths(paths: Array<string>) {
    let fullPaths = [];
    if (paths) {
      for (let a = 0; a < paths.length; a++) {
        fullPaths.push(await getItem(paths[a], 'path'));
      }
    }

    return fullPaths;
  }

  async _getLegendaries(legendaries: Array<string>) {
    let fullAbilities = [];
    if (legendaries) {
      for (let a = 0; a < legendaries.length; a++) {
        fullAbilities.push(await getItem(legendaries[a], 'ability'));
      }
    }

    return fullAbilities;
  }

  _onDeletePath(event: JQuery.ClickEvent) {
    event.preventDefault();
    const index = Number(event.currentTarget.closest('.path').dataset.index);
    const updateData = duplicate(this.item.data);
    updateData.data.paths.splice(index, 1);

    this.item.update(updateData, {});
  }

  _onDeleteLegendary(event: JQuery.ClickEvent) {
    event.preventDefault();
    const index = Number(event.currentTarget.closest('.legendary').dataset.index);
    const updateData = duplicate(this.item.data);
    updateData.data.legendaries.splice(index, 1);

    this.item.update(updateData, {});
  }
}

interface RoleSheetData extends ItemSheetData {
  paths: Array<PathItem>;
  legendaries: Array<AbilityItem>;
}
