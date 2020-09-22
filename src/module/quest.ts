/**
 * The Quest game system for Foundry Virtual Tabletop
 * Author: Easternwind
 * Software License: Creative Commons Attribution 4.0 International License
 * Content License:
 * Repository: https://github.com/kbedell/quest-vtt
 * Issue Tracker: https://github.com/kbedell/quest-vtt/issues
 */

import { QUEST } from './config';
import { registerSystemSettings } from './settings';
import { preloadHandlebarsTemplates } from './templates';
import { registerHandlebarsHelpers } from './helper/handlebars-helpers';
import { QuestItem } from './item/quest-item';
import { AbilityItemSheet } from './item/sheets/ability-item-sheet';
import { PathItemSheet } from './item/sheets/path-item-sheet';
import { RoleItemSheet } from './item/sheets/role-item-sheet';
import { GearItemSheet } from './item/sheets/gear-item-sheet';
import { ItemSheetQuest } from './item/sheets/item-sheet-quest';
// import { template } from 'handlebars';
// import { QuestBaseApplication } from './apps/QuestBaseApplication';
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function () {
  console.log(`Quest| Initializing Quest System\n`);

  // Create a Quest namespace within the game global
  game.quest = {
    QuestItem
  };

  // Record Configuration Values
  CONFIG.QUEST = QUEST;
  CONFIG.Item.entityClass = QuestItem;
  CONFIG.Item.sheetClasses = ItemSheetQuest;

  // Register System Settings
  registerSystemSettings();

  registerHandlebarsHelpers();

  // Register sheet application classes
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('quest', AbilityItemSheet, {
    types: ['ability'],
    makeDefault: true
  });
  Items.registerSheet('quest', PathItemSheet, {
    types: ['path'],
    makeDefault: true
  });
  Items.registerSheet('quest', RoleItemSheet, {
    types: ['role'],
    makeDefault: true
  });
  Items.registerSheet('quest', GearItemSheet, {
    types: ['gear'],
    makeDefault: true
  });

  preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once('setup', function () {
  // Localize CONFIG objects once up-front
  const toLocalize = ['rarities'];
  for (let o of toLocalize) {
    CONFIG.QUEST[o] = Object.entries(CONFIG.QUEST[o]).reduce((obj: any, e: any) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

Hooks.once('preCreateItem', function (data: any, options: any) {
  if (data.img === 'icons/svg/mystery-man.svg' || !data.img) {
    switch (data.type) {
      case 'role':
        data.img = 'systems/quest/assets/icons/upgrade.png';
        break;
      case 'path':
        data.img = 'systems/quest/assets/icons/skills.png';
        break;
      case 'ability':
        data.img = 'systems/quest/assets/icons/symbol_ability_small_white.svg';
        break;
      case 'effect':
        data.img = 'systems/quest/assets/icons/symbol_effect_small_white.svg';
        break;
      case 'gear':
        data.img = 'systems/quest/assets/icons/symbol_gear_small_white.svg';
        break;
    }
  }
});
