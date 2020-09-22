export async function getItem(id: string, type: string) {
  let compendiums: any = [];
  let item;

  const customCompendium = game.settings.get('quest', 'customCompendium');

  const rolesCompendiums = ['quest-basic.roles', 'world.roles'];

  const abilitiesCompendiums = ['quest-basic.abilities', 'world.abilities'];

  const pathsCompendiums = ['quest-basic.paths', 'world.paths'];

  const gearCompendiums = ['quest-basic.gear', 'world.gear'];

  switch (type) {
    case 'ability':
      compendiums = abilitiesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.abilities');
      }
      break;
    case 'path':
      compendiums = pathsCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.paths');
      }
      break;
    case 'role':
      compendiums = rolesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.roles');
      }
      break;
    case 'gear':
      compendiums = gearCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.gear');
      }
      break;
  }

  for (let c = 0; c < compendiums.length; c++) {
    let pack = game.packs.get(compendiums[c]);

    if (pack) {
      item = await pack.getEntity(id);

      if (!item) continue;

      return item.data;
    }
  }

  if (!item || typeof item === 'undefined') {
    item = game.items.get(id);

    // TODO: Add error handling if item not found at all.

    return item.data;
  }
}

export async function getItemByName(name: string, type: string) {
  let compendiums: any = [];
  let item;

  const customCompendium = game.settings.get('quest', 'customCompendium');

  const rolesCompendiums = ['quest-basic.roles', 'world.roles'];

  const abilitiesCompendiums = ['quest-basic.abilities', 'world.abilities'];

  const pathsCompendiums = ['quest-basic.paths', 'world.paths'];

  const gearCompendiums = ['quest-basic.gear', 'world.gear'];

  switch (type) {
    case 'ability':
      compendiums = abilitiesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.abilities');
      }
      break;
    case 'path':
      compendiums = pathsCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.paths');
      }
      break;
    case 'role':
      compendiums = rolesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.roles');
      }
      break;
    case 'gear':
      compendiums = gearCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.gear');
      }
      break;
  }

  for (let c = 0; c < compendiums.length; c++) {
    let pack = game.packs.get(compendiums[c]);

    if (pack) {
      let packData = await pack.getContent();

      item = packData.find((i: any) => i.name === name);

      if (!item) continue;

      return item.data;
    }
  }

  if (!item || typeof item === 'undefined') {
    item = game.items.find((i: any) => i.name === name);

    // TODO: Add error handling if item not found at all.

    return item.data;
  }
}

export async function getAllItems(type: string, full: boolean) {
  const items: any = [];
  let compendiums: any = [];

  const customCompendium = game.settings.get('quest', 'customCompendium');

  const rolesCompendiums = ['quest-basic.roles', 'world.roles'];

  const abilitiesCompendiums = ['quest-basic.abilities', 'world.abilities'];

  const pathsCompendiums = ['quest-basic.paths', 'world.paths'];

  const gearCompendiums = ['quest-basic.gear', 'world.gear'];

  switch (type) {
    case 'ability':
      compendiums = abilitiesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.abilities');
      }
      break;
    case 'path':
      compendiums = pathsCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.paths');
      }
      break;
    case 'role':
      compendiums = rolesCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.roles');
      }
      break;
    case 'gear':
      compendiums = gearCompendiums;
      if (customCompendium !== '') {
        compendiums.push(customCompendium + '.gear');
      }
      break;
  }

  for (let c = 0; c < compendiums.length; c++) {
    let packData: any;
    let pack = game.packs.get(compendiums[c]);

    if (pack) {
      if (full) {
        packData = await pack.getContent();

        for (let i = 0; i < packData.length; i++) {
          if (!items.find((item: any) => item.name === packData[i].data.name)) {
            items.push(packData[i].data);
          }
        }
      } else {
        packData = await pack.getData();

        for (let i = 0; i < packData.index.length; i++) {
          if (!items.find((item: any) => item.name === packData.index[i].name)) {
            items.push(packData.index[i]);
          }
        }
      }
    }
  }

  const gameItems = game.items.entities.filter((i) => i.type === type);

  for (let g = 0; g < gameItems.length; g++) {
    if (!items.find((i: any) => i.name === gameItems[g].data.name)) {
      if (full) {
        items.push(gameItems[g].data);
      } else {
        items.push({
          _id: gameItems[g]._id,
          img: gameItems[g].data.img,
          name: gameItems[g].data.name
        });
      }
    }
  }

  return items;
}
