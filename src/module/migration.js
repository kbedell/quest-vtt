/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(
    `Applying Quest System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
    { permanent: true }
  );

  for (let i of game.items.entities) {
    try {
      const updateData = migrateItemData(i.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  const packs = game.packs.filter((p) => {
    return (
      p.metadata.package === "world" && ["Item"].includes(p.metadata.entity)
    );
  });
  for (let p of packs) {
    await migrateCompendium(p);
  }

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

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
  const entity = pack.metadata.entity;
  if (!["Item"].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    try {
      let updateData = null;
      if (entity === "Item") updateData = migrateItemData(ent.data);
      if (!isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData["_id"] = ent._id;
        await pack.updateEntity(updateData);
        console.log(
          `Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
  console.log(
    `Migrated all ${entity} entities from Compendium ${pack.collection}`
  );
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function(item) {
  const updateData = {};

  // Remove deprecated fields
  _migrateRemoveDeprecated(item, updateData);

  // Return the migrated update data
  return updateData;
};

/* -------------------------------------------- */
/*  Low level migration utilities               */
/* -------------------------------------------- */

/**
 * A general migration to remove all fields from the data model which are flagged with a _deprecated tag
 * @private
 */
const _migrateRemoveDeprecated = function(ent, updateData) {
  const flat = flattenObject(ent.data);

  // Identify objects to deprecate
  const toDeprecate = Object.entries(flat).filter(e => e[0].endsWith("_deprecated") && (e[1] === true)).map(e => {
    let parent = e[0].split(".");
    parent.pop();
    return parent.join(".");
  });

  // Remove them
  for ( let k of toDeprecate ) {
    let parts = k.split(".");
    parts[parts.length-1] = "-=" + parts[parts.length-1];
    updateData[`data.${parts.join(".")}`] = null;
  }
};
