/**
 * The Quest game system for Foundry Virtual Tabletop
 * Author: Easternwind
 * Software License: Creative Commons Attribution 4.0 International License
 *
 * Repository:
 * Issue Tracker:
 */

// Import Modules
import { QUEST } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { ActorQuest } from "./actor/entity.js";
import { CharacterSheetQuest } from "./actor/sheets/character.js";
import { ItemQuest } from "./item/entity.js";
import { RangeSheetQuest } from "./item/sheets/range.js";
import { EffectSheetQuest } from "./item/sheets/effect.js";
import { AbilitySheetQuest } from "./item/sheets/ability.js";
import { PathSheetQuest } from "./item/sheets/path.js";
import { RoleSheetQuest } from "./item/sheets/role.js";
import * as chat from "./chat.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log(`Quest| Initializing Quest System\n`);

  // Create a Quest namespace within the game global
  game.quest = {
    ActorQuest,
    ItemQuest,
  };

  // Record Configuration Values
  CONFIG.QUEST = QUEST;
  CONFIG.Actor.entityClass = ActorQuest;
  CONFIG.Item.entityClass = ItemQuest;

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("quest", CharacterSheetQuest, {
    types: ["character"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("quest", RangeSheetQuest, {
    types: ["range"],
    makeDefault: true,
  });
  Items.registerSheet("quest", EffectSheetQuest, {
    types: ["effect"],
    makeDefault: true,
  });
  Items.registerSheet("quest", AbilitySheetQuest, {
    types: ["ability"],
    makeDefault: true,
  });
  Items.registerSheet("quest", PathSheetQuest, {
    types: ["path"],
    makeDefault: true,
  });
  Items.registerSheet("quest", RoleSheetQuest, {
    types: ["role"],
    makeDefault: true,
  });

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [];
  for (let o of toLocalize) {
    CONFIG.QUEST[o] = Object.entries(CONFIG.QUEST[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */
Hooks.on("renderChatMessage", (app, html, data) => {
  // Optionally collapse the content
  // if (game.settings.get("quest", "autoCollapseItemCards"))
  //   html.find(".card-content").hide();
});
