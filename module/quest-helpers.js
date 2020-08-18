export async function getItem(itemId, type) {
    let compendium = "";
    switch (type) {
        case "range":
            compendium = "world.ranges";
            break;
        case "effect":
            compendium = "world.effects";
            break;
        case "ability":
            compendium = "world.abilities";
            break;
        case "path":
            compendium = "world.paths";
            break;
        case "role":
            compendium = "world.roles";
            break;
    }

    // We always search compendiums first
    let pack = game.packs.find((p) => p.collection === compendium);
    let item;

    if (pack) {
        item = await pack.getEntity(itemId);
    } 

    if (!item || typeof item === "undefined") {
        item = game.items.get(itemId);
    }
    
    return item;
}

export async function getAllItems(type) {
    let compendium = "";
    const items = [];
    let fullList = [];
    let existing = [];

    switch (type) {
        case "range":
            compendium = "world.ranges";
            break;
        case "effect":
            compendium = "world.effects";
            break;
        case "ability":
            compendium = "world.abilities";
            break;
        case "path":
            compendium = "world.paths";
            break;
        case "role":
            compendium = "world.roles";
            break;
    }

    //We always search compendiums first
    const pack = game.packs.find((p) => p.collection === compendium);

    if (pack) {
        const packData = await pack.getData();
        for (let i = 0; i < packData.index.length; i++ ) {
            let item = await pack.getEntity(packData.index[i]._id);
            fullList.push(item.data);
        }
    }

    const gameItems = game.items.entities;

    for (let g = 0; g < gameItems.length; g++) {
        if (gameItems[g].data.type === type) {
            fullList.push(gameItems[g].data);
        }
    }

    for (let fl = 0; fl < fullList.length; fl++) {
        if (fullList[fl].pack && !existing.includes(fullList[fl].name)) {
            items.push(fullList[fl]);
            existing.push(fullList[fl].name);
        } else if (!existing.includes(fullList[fl].name)) {
            items.push(fullList[fl]);
            existing.push(fullList[fl].name);
        }
    }

    return items;
}

export async function getFullAbilityData(abilityId) {
    let ability = await getItem(abilityId, "ability");
    let effects = ability.data.data.effects;
    let fullAbility = {};
    let allEffects = [];

    for (let e = 0; e < effects.length; e++) {
        let effect = await getItem(effects[e], "effect");
        let ranges = effect.data.data.ranges;
        let allRanges = [];

        if (ranges.length > 0) {
            for (let r = 0; r < ranges.length; r++) {
                let range = await getItem(ranges[r]);
                allRanges.push(range);
            }
        }

        allEffects.push({
            effect: effect,
            ranges: allRanges
        });
    }

    fullAbility = {
        ability: ability,
        effects: allEffects
    }

    return fullAbility;
}