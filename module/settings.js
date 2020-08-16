export const registerSystemSettings = function () {
  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("quest", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });

  game.settings.register("quest", "abilityMode", {
    name: game.i18n.localize('SETTINGS.AbilitySelection'),
    hint: game.i18n.localize('SETTINGS.AbilitySelectionHint'),
    scope: "world",
    config: true,
    default: "default",
    type: String,
    choices: {
      "roles": "SETTINGS.Roles",
      "quirks": "SETTINGS.Quirks",
      "dual-roles": "SETTINGS.DualRoles",
      "no-roles": "SETTINGS.NoRoles"
    },
    onChange: rule => _setAbilityMode(rule)
  });

  _setAbilityMode(game.settings.get("quest", "abilityMode"));

  function _setAbilityMode(abilityMode) {
    CONFIG.abilityMode = abilityMode;
  }
};
