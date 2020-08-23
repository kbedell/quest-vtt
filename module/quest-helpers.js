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
    }

    for (let c = 0; c < compendiums.length; c++) {
        let pack = game.packs.find((p) => p.collection === compendiums[c]);

        if (pack) {
            item = await pack.getEntity(itemId);

            if (!item) continue;

            return item;
        }
    }

    if (!item || typeof item === "undefined") {
        item = game.items.get(itemId);
    }

    if (!item || typeof item === "undefined") {
        // Error handling
    }
    
    return item;
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
    }

    for (let c = 0; c < compendiums.length; c++) {
        let pack = game.packs.find((p) => p.collection === compendiums[c]);

        if (pack) {
            const packData = await pack.getData();
            for (let i = 0; i < packData.index.length; i++ ) {
                let item = await pack.getEntity(packData.index[i]._id);

                if (!items.find((i) => i.name === item.name)) {
                    items.push(item);
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