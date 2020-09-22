export function registerSystemSettings(): void {
  game.settings.register("quest", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });

  game.settings.register("quest", "abilityMode", {
    name: game.i18n.localize("SETTINGS.AbilitySelection"),
    hint: game.i18n.localize("SETTINGS.AbilitySelectionHint"),
    scope: "world",
    config: true,
    default: "single-role",
    type: String,
    choices: {
      "single-role": "SETTINGS.Roles",
      "quirks": "SETTINGS.Quirks",
      "dual-roles": "SETTINGS.DualRoles",
      "no-roles": "SETTINGS.NoRoles",
      "no-masters": "SETTINGS.NoMasters",
    },
    onChange: (rule: string) => _setAbilityMode(rule),
  });

  _setAbilityMode(game.settings.get("quest", "abilityMode"));

  function _setAbilityMode(abilityMode: string) {
    CONFIG.abilityMode = abilityMode;
  }

  game.settings.register("quest", "quirkLimit", {
    name: game.i18n.localize("SETTINGS.QuirkLimit"),
    hint: game.i18n.localize("SETTINGS.QuirkLimitHint"),
    scope: "world",
    config: true,
    default: 1,
    type: Number,
    onChange: (rule: number) => _setQuirkLimit(rule),
  });

  _setQuirkLimit(game.settings.get("quest", "quirkLimit"));

  function _setQuirkLimit(limit: number) {
    CONFIG.quirkLimit = limit;
  }

  game.settings.register("quest", "inventorySize", {
    name: game.i18n.localize("SETTINGS.InventorySize"),
    hint: game.i18n.localize("SETTINGS.InventorySizeHint"),
    scope: "world",
    config: true,
    default: 12,
    type: Number,
    onChange: (rule: number) => _setInventorySize(rule),
  });

  _setInventorySize(game.settings.get("quest", "inventorySize"));

  function _setInventorySize(size: number) {
    CONFIG.inventorySize = size;
  }

  game.settings.register("quest", "customCompendium", {
    name: game.i18n.localize("SETTINGS.CustomCompendium"),
    hint: game.i18n.localize("SETTINGS.CustomCompendiumHint"),
    scope: "world",
    config: true,
    default: "",
    type: String,
    onChange: (rule: string) => _setCustomCompendium(rule),
  });

  _setCustomCompendium(game.settings.get("quest", "customCompendium"));

  function _setCustomCompendium(customCompendium: string) {
    CONFIG.customCompendium = customCompendium;
  }
}
