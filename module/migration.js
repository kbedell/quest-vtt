/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(
    `Applying Quest System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
    { permanent: true }
  );

  game.settings.set(
    "quest",
    "systemMigrationVersion",
    game.system.data.version
  );
  ui.notifications.info(
    `Quest System Migration to version ${game.system.data.version} completed!`,
    { permanent: true }
  );
};
