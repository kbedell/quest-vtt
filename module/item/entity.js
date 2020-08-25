import { getItem } from "../quest-helpers.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export class ItemQuest extends Item {
  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  async onDragItemStart(event) {
    event.stopPropagation();
    const itemId = Number(event.currentTarget.dataset.itemId);
    let item = items.find((i) => i._id === itemId);
    item = duplicate(item);
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        data: item,
      })
    );
  }

  async onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));

      if (!this) return false;

      let updateData = duplicate(this.data);
      let gameItem = game.items.get(data.id);

      switch (this.data.type) {
        case "ability":
          if (
            (data.pack && data.pack === "quest-basic.effects") ||
            (data.pack && data.pack === "world.effects") ||
            ( gameItem && gameItem.type === "effect")
          ) {
            updateData.data.effects.push(data.id);
          }
          break;
        case "effect":
          if (
            (data.pack && data.pack === "quest-basic.ranges") ||
            (data.pack && data.pack === "world.ranges") ||
            ( gameItem && gameItem.type === "range")
          ) {
            updateData.data.ranges.push(data.id);
          }
          break;
        case "path":
          if (
            (data.pack && data.pack === "quest-basic.abilities") ||
            (data.pack && data.pack === "world.abilities") ||
            ( gameItem && gameItem.type === "ability")
          ) {
            updateData.data.abilities.push(data.id);
          }
          break;
        case "role":
          if (
            (data.pack && data.pack === "quest-basic.paths") ||
            (data.pack && data.pack === "world.paths") ||
            ( gameItem && gameItem.type === "path")
          ) {
            updateData.data.paths.push(data.id);
          } else if (
            (data.pack && data.pack === "quest-basic.abilities") ||
            (data.pack && data.pack === "world.abilities") ||
            ( gameItem && gameItem.type === "ability")
          ) {
            updateData.data.legendaries.push(data.id);
          }
          break;
      }

      await this.update(updateData);
    } catch (err) {
      console.log("Quest Items | drop error");
      console.log(event.dataTransfer.getData("text/plain"));
      console.log(err);
    } finally {
      event.target.classList.remove("hover");
      return false;
    }
  }

  onDragEnd(event) {
    event.preventDefault();
    return false;
  }

  onDragOver(event) {
    event.preventDefault();
    return false;
  }

  onDragEnter(event) {
    event.preventDefault();
    if (event.target.className === "adder") {
      event.target.classList.add("hover");
    }
    return false;
  }

  onDragLeave(event) {
    event.preventDefault();
    if (event.target.className === "adder hover") {
      event.target.classList.remove("hover");
    }
    return false;
  }

  async getItems(items, type) {
    let displayItems = [];

    for (let i = 0; i < items.length; i++) {
      let id = items[i];

      let item = await getItem(id, type);

      if (type === "ability") {
        displayItems.push({
          name: item.data.name,
          id: item._id,
          order: i + 1
        });
      } else {
        displayItems.push({
          name: item.data.name,
          id: item._id,
        });
      }
    }

    return displayItems;
  }

  async onDeleteItem(event) {
    event.preventDefault();

    let updateData = duplicate(this.data);
    const itemId = Number(event.currentTarget.closest(".item").dataset.itemId);

    switch (this.type) {
      case "effect":
        updateData.data.ranges.splice(itemId, 1);
        break;
      case "ability":
        updateData.data.effects.splice(itemId, 1);
        break;
      case "path":
        updateData.data.abilities.splice(itemId, 1);
        break;
      case "role":
        const type = event.currentTarget.closest(".item").dataset.typeDelete;

        if (type === "path") {
          updateData.data.paths.splice(itemId, 1);
        } else if (type === "ability") {
          updateData.data.legendaries.splice(itemId, 1);
        }
        break;
    }

    await this.update(updateData);

    this.render(true);
    return false;
  }
}
