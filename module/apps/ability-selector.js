/**
 * A specialized form used to selecting abilities
 * @extends {FormApplication}
 */
export class AbilitySelector extends FormApplication {
    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "ability-selector",
        classes: ["quest"],
        title: "Ability Selection",
        template: "systems/quest/templates/apps/ability-selector.html",
        width: 320,
        height: "auto",
        choices: {}
      });
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      // Get current values
      const abilities = this.object.data.data.abilities;
      let list = [];

      for (let i = 0; i < abilities.length; i++) {
        list.push(abilities[i]._id);
      }
  
      // Populate choices
      const options = duplicate(this.options.choices);
      const choices = [];

      for (let h = 0; h < options.length; h++) {
        const abilityData = [];
        for (let i = 0; i < options[h].abilities.length; i++) {
          let available = false;

          if (i === 0 ) {
            available = true;
          } else if (i != 0 && list.includes(options[h].abilities[i-1].name)) {
            available = true;
          }
          
          abilityData.push({
            label: options[h].abilities[i].name,
            id: options[h].abilities[i]._id,
            order: i,
            chosen: list ? list.includes(options[h].abilities[i]._id) : false,
            available: available
          });
        }

        choices.push({
          name: options[h].name,
          abilities: abilityData
        });
      }

      return {
        choices: choices
      };
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    async _updateObject(event, formData) {
      const updateData = {};
      const pack = game.packs.find((p) => p.collection === "world.abilities");
      let ability = {};
  
      // Obtain choices
      const chosen = [];
      for (let [k, v] of Object.entries(formData)) {
        if (v) {
          if (pack && v) {
            ability = await pack.getEntity(k);
          } else if (v) {
            ability = game.items.get(k);
          }
  
          chosen.push(ability.data);
        }
      }
      
      updateData['data.abilities'] = chosen;
      // Update the object
      this.object.update(updateData);
    }
  }
  