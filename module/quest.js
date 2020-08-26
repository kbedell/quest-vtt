/**
 * The Quest game system for Foundry Virtual Tabletop
 * Author: Easternwind
 * Software License: Creative Commons Attribution 4.0 International License
 * Content Licesend:
 * Repository:
 * Issue Tracker:
 */

// Import Modules
import { QUEST } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { ActorQuest } from "./actor/entity.js";
import { CharacterSheetQuest } from "./actor/sheets/character.js";
import { NPCSheetQuest } from "./actor/sheets/npc.js";
import { ItemQuest } from "./item/entity.js";
import { PathSheetQuest } from "./item/sheets/path.js";
import { RoleSheetQuest } from "./item/sheets/role.js";
import { GearSheetQuest } from "./item/sheets/gear.js";
import { AbilityBuilderQuest } from "./item/sheets/ability-builder.js";
import * as migrations from "./migration.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log(`Quest| Initializing Quest System\n`);

  // Create a Quest namespace within the game global
  game.quest = {
    ActorQuest,
    ItemQuest,
    rollAbilityMacro,
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
  Actors.registerSheet("quest", NPCSheetQuest, {
    types: ["npc"],
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
  Items.registerSheet("quest", GearSheetQuest, {
    types: ["gear"],
    makeDefault: true,
  });

  Handlebars.registerHelper("breaklines", function (text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
    return new Handlebars.SafeString(text);
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
  const toLocalize = ["rarities"];
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
Hooks.once("ready", function () {
  ui.notifications.info(
    "<div style='text-align:center;'><h2>Welcome to the Quest system for Foundry VTT.</h2><p>Quest was created by The Adventure Guild (https://adventure.game.)<p></div>"
  );

  const currentVersion = game.settings.get("quest", "systemMigrationVersion");
  const NEEDS_MIGRATION_VERSION = 1.4;
  const COMPATIBLE_MIGRATION_VERSION = 1.0;
  let needMigration =
    currentVersion < NEEDS_MIGRATION_VERSION || currentVersion === null;
  const canMigrate = currentVersion >= COMPATIBLE_MIGRATION_VERSION;

  if (needMigration && game.user.isGM) {
    if (currentVersion && currentVersion < COMPATIBLE_MIGRATION_VERSION && canMigrate) {
      ui.notifications.error(
        `Your Quest system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`,
        { permanent: true }
      );
    }
    migrations.migrateWorld();
  }

  Hooks.on("hotbarDrop", (bar, data, slot) => createQuestMacro(data, slot));
});

Hooks.once("preCreateActor", (createData) => {
  if (createData.type == "character") {
    mergeObject(createData, {
      "token.bar1": { attribute: "hitpoints" },
      "token.bar2": { attribute: "actionpoints" },
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      "token.name": createData.name,
    });

    createData.token.vision = true;
    createData.token.actorLink = true;
  } else if (createData.type == "npc") {
    mergeObject(createData, {
      "token.bar1": { attribute: "hitpoints" },
      "token.bar2": { attribute: "attack" },
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "token.name": createData.name,
    });
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
  if (data.type !== "Item") return;
  const item = data.data;

  // Create the macro command
  const command = `game.quest.rollAbilityMacro("${item.item}", "${item.effect}", "${item.name}", "${item.actor}");`;
  let macro = game.macros.entities.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: "systems/quest/icons/dice-fire.png",
      command: command,
      flags: { "quest.abilityMacro": true },
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

  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(actorId);

  const item = actor
    ? actor.data.data.abilities.find((i) => i === abilityId)
    : null;

  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have an ability named ${name}`
    );

  // Trigger the item roll
  return actor.rollAbility({
    actor: actor,
    effectId: effectId,
    abilityId: abilityId,
  });
}
