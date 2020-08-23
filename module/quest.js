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
import { PathSheetQuest } from "./item/sheets/path.js";
import { RoleSheetQuest } from "./item/sheets/role.js";
import { AbilityBuilderQuest } from "./item/sheets/ability-builder.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log(`Quest| Initializing Quest System\n`);

  // Create a Quest namespace within the game global
  game.quest = {
    ActorQuest,
    ItemQuest,
    rollAbilityMacro
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
  Items.registerSheet("quest", AbilityBuilderQuest, {
    types: ["ability"],
    makeDefault: true,
  });
  Items.registerSheet("quest", RoleSheetQuest, {
    types: ["role"],
    makeDefault: true,
  });
  Items.registerSheet("quest", PathSheetQuest, {
    types: ["path"],
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
/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createQuestMacro(data, slot));
});


Hooks.once("preCreateActor", (createData) => {
  mergeObject(createData,{
    "token.bar1": {"attribute": "hitpoints"},   
    "token.bar2": {"attribute": "actionpoints"},
    "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,  
    "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.disposition" : CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    "token.name" : createData.name      
  });

  if (createData.type == "character")
  {
    createData.token.vision = true;
    createData.token.actorLink = true;
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createQuestMacro(data, slot) {
  if ( data.type !== "Item" ) return;
  const item = data.data;

  // Create the macro command
  const command = `game.quest.rollAbilityMacro("${item.item}", "${item.effect}", "${item.name}", "${item.actor}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if ( !macro ) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: "systems/quest/icons/dice-fire.png",
      command: command,
      flags: {"quest.abilityMacro": true}
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollAbilityMacro(abilityId, effectId, name, actorId) {
  const speaker = ChatMessage.getSpeaker();
  let actor;

  if ( speaker.token ) actor = game.actors.tokens[speaker.token];
  if ( !actor ) actor = game.actors.get(actorId);

  const item = actor ? actor.data.data.abilities.find(i => i === abilityId) : null;

  if ( !item ) return ui.notifications.warn(`Your controlled Actor does not have an ability named ${name}`);
  
  // Trigger the item roll
  return actor.rollAbility({actor: actor, effectId: effectId, abilityId: abilityId});
}
