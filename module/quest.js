/**
 * The Quest game system for Foundry Virtual Tabletop
 * Author: Easternwind
 * Software License: Creative Commons Attribution 4.0 International License
 * 
 * Repository: 
 * Issue Tracker: 
 */

// Import Modules
import { Quest } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { CharacterQuest } from "./actor/entity.js";
import { CharacterSheetQuest } from "./actor/sheets/character.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {
    console.log(`Quest| Initializing Quest System\n`);
  
    // Create a Quest namespace within the game global
    game.quest = {
      CharacterQuest
    };
  
    // Record Configuration Values
    CONFIG.QUEST = QUEST;
    CONFIG.Actor.entityClass = CharacterQuest;
  
    // Register System Settings
    registerSystemSettings();
  
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("quest", CharacterSheetQuest, { types: ["character"], makeDefault: true });
  
    // Preload Handlebars Templates
    preloadHandlebarsTemplates();
  });