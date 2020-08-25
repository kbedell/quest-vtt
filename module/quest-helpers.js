export async function getItem(itemId, type) {
    let compendiums = [];
    let item;

    const customCompendium = game.settings.get("quest", "customCompendium");

    const rolesCompendiums = [
        "quest-basic.roles",
        "world.roles"
    ];

    const abilitiesCompendiums = [
        "quest-basic.abilities",
        "world.abilities"
    ];

    const pathsCompendiums = [
        "quest-basic.paths",
        "world.paths"
    ];

    const gearCompendiums = [
        "quest-basic.gear",
        "world.gear"
    ];

    switch (type) {
        case "ability":
            compendiums = abilitiesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".abilities");
            }
            break;
        case "path":
            compendiums = pathsCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".paths");
            }
            break;
        case "role":
            compendiums = rolesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".roles");
            }
            break;
        case "gear":
            compendiums = rolesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".gear");
            }
            break;
    }

    for (let c = 0; c < compendiums.length; c++) {
        let pack = game.packs.find((p) => p.collection === compendiums[c]);

        if (pack) {
            item = await pack.getEntity(itemId);

            if (!item) continue;

            return item.data;
        }
    }

    if (!item || typeof item === "undefined") {
        item = game.items.get(itemId);

        // TODO: Add error handling if item not found at all.

        return item.data;
    }
}

export async function getAllItems(type) {
    const items = [];
    let compendiums = [];

    const customCompendium = game.settings.get("quest", "customCompendium");

    const rolesCompendiums = [
        "quest-basic.roles",
        "world.roles"
    ];

    const abilitiesCompendiums = [
        "quest-basic.abilities",
        "world.abilities"
    ];

    const pathsCompendiums = [
        "quest-basic.paths",
        "world.paths"
    ];

    const gearCompendiums = [
        "quest-basic.gear",
        "world.gear"
    ];

    switch (type) {
        case "ability":
            compendiums = abilitiesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".abilities");
            }
            break;
        case "path":
            compendiums = pathsCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".paths");
            }
            break;
        case "role":
            compendiums = rolesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".roles");
            }
            break;
        case "gear":
            compendiums = rolesCompendiums;
            if (customCompendium !== "") {
                compendiums.push(customCompendium + ".gear");
            }
            break;
    }

    for (let c = 0; c < compendiums.length; c++) {
        let pack = game.packs.find((p) => p.collection === compendiums[c]);

        if (pack) {
            const packData = await pack.getData();
            for (let i = 0; i < packData.index.length; i++ ) {
                let item = await pack.getEntity(packData.index[i]._id);

                if (!items.find((i) => i.name === item.name)) {
                    items.push(item.data);
                }
            }
        }
    }

    const gameItems = game.items.entities.filter((i) => i.type === type);

    for (let g = 0; g < gameItems.length; g++) {
        if (!items.find((i) => i.name === gameItems[g].data.name)) {
            items.push(gameItems[g].data);
        }
    }

    return items;
}

export async function getFormData(formData) {
    let object = {};
    formData.forEach((value, key) => {
        if(!Reflect.has(object, key)){
            object[key] = value;
            return;
        }
        if(!Array.isArray(object[key])){
            object[key] = [object[key]];    
        }
        object[key].push(value);
    });

    return object;
}

export function compareLabels(a,b) {
    const objectA = a.label.toLowerCase();
    const objectB = b.label.toLowerCase();
  
    let comparison = 0;
    if (objectA > objectB) {
      comparison = 1;
    } else if (objectA < objectB) {
      comparison = -1;
    }
    return comparison;
  }