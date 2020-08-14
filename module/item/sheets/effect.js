import { ItemSheetQuest } from "./base.js";

/**
 * An Item sheet for option type items in the Quest system.
 * Extends the base ItemSheetQuest class.
 * @type {ItemSheetQuest}
 */
export class EffectSheetQuest extends ItemSheetQuest {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 460,
      height: 520,
      classes: ["quest", "sheet", "item", "effect"],
      resizable: true
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    data.displayRanges = this._getRanges(data.item);
    console.log(data);

    return data;
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
	/* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {

    // Handle Damage Array
    let damage = Object.entries(formData).filter(e => e[0].startsWith("data.damage.parts"));
    formData["data.damage.parts"] = damage.reduce((arr, entry) => {
      let [i, j] = entry[0].split(".").slice(3);
      if ( !arr[i] ) arr[i] = [];
      arr[i][j] = entry[1];
      return arr;
    }, []);

    // Update the Item
    super._updateObject(event, formData);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".item-delete").click(this._onDeleteItem.bind(this));

    this.form.ondragover = (ev) => this._onDragOver(ev);
    this.form.ondrop = (ev) => this._onDrop(ev);
    this.form.ondragenter = (ev) => this._onDragEnter(ev);
    this.form.ondragleave = (ev) => this._onDragLeave(ev);

    document.addEventListener("dragend", this._onDragEnd.bind(this));
  }

  async _onDragItemStart(event) {
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

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      let range = game.items.get(data.id);

      // TODO: Account for getting data from compendium

      if (this.item.data.type === "effect" && range.data.type === "range") {
        let updateData = duplicate(this.item.data);

        if (!updateData.data.ranges.includes(data.id)) {
          updateData.data.ranges.push(data.id);
          await this.item.update(updateData);
          event.target.classList.remove("hover");
          this.render(true);
        }
        return false;
      }
    } catch (err) {
      console.log("Quest Items | drop error");
      console.log(event.dataTransfer.getData("text/plain"));
      console.log(err);
    }

    return false;
  }

  _onDragEnd(event) {
    event.preventDefault();
    return false;
  }
  _onDragOver(event) {
    event.preventDefault();
    return false;
  }

  _onDragEnter(event) {
    event.preventDefault();
    if (event.target.className === "adder") {
      event.target.classList.add("hover");
    }
    return false;
  }

  _onDragLeave(event) {
    event.preventDefault();
    if (event.target.className === "adder hover") {
      event.target.classList.remove("hover");
    }
    return false;
  }

  _getRanges(item) {
    let ranges = [];

    for (var i = 0; i < item.data.ranges.length; i++) {
      let newRange = {};
      let range = game.items.get(item.data.ranges[i]);

      newRange = {
        name: range.data.name,
        description: range.data.data.description.value,
        min: range.data.data.min,
        max: range.data.data.max,
        id: item.data.ranges[i]
      };

      ranges.push(newRange);
    }

    return ranges;
  }

  _onDeleteItem(event) {
    event.preventDefault();

    let updateData = duplicate(this.item.data);
    const rangeId = event.currentTarget.closest(".item").dataset.itemId;
    const newRanges = updateData.data.ranges.filter(e => e !== rangeId);

    updateData.data.ranges = newRanges;
    this.item.update(updateData);
    this.render(true);
    return false;
  }
}
