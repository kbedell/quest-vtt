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
    let item = {};

    if (pack) {
        item = await pack.getEntity(itemId);
    } else {
        const gameItems = game.items.entities;

        for (let i = 0; i < gameItems.length; i++) {
            if (gameItems[i].data._id === itemId) {
                item = gameItems[i].data;
            }
        }
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
            let item = await pack.getEntity(packData.index[i]);
            fullList.push(item.data);
        }
    }

    const gameItems = game.items.entities;

    gameItems.forEach(item => {
        if (item.data.type === "type") {
            fullList.push(item.data);
        }
    });

    fullList.forEach(item => {
        if (item.pack && !existing.includes(item.name)) {
            items.push(item._id);
            existing.push(item.name);
        } else if (!existing.includes(item.name)) {
            items.push(item._id);
            existing.push(item.name);
        }
    });
}