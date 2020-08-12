export class DiceQuest {
  /**
   * A standardized helper function for managing core Quest d20 rolls
   *
   * @param {Event|object} event    The triggering event which initiated the roll
   * @param {Object} speaker        The ChatMessage speaker to pass when creating the chat
   * @param {string|null} flavor    Flavor text to use in the posted chat message
   *
   * @return {Promise}              A Promise which resolves once the roll workflow has completed
   */

   static async d20Roll({event={}, title=null, speaker=null, flavor=null}) {
       flavor = flavor || title;
       speaker = speaker || ChatMessage.getSpeaker();
       let rollMode = game.settings.get("core", "rollmode");
       let rolled = false;

       const _roll = function(form) {
           let roll = new Roll("1d20").roll();

           if (roll.total === 20) {
               flavor = `${flavor} (Triumph)`;
           } else if (roll.total < 20 && roll.total > 10) {
               flavor = `${flavor} (Success)`;
           } else if (roll.total < 11 && roll.total > 5) {
               flavor = `${flavor} (Tought Choice)`;
           } else if (roll.total < 6 && roll.total > 1) {
               flavor = `${flavor} (Failure)`;
           } else if (roll.total === 1) {
               flavor = `${flavor} (Catastrophe)`;
           }

           rollMode = form ? form.rollMode.value : rollMode;
           roll.toMessage({
               speaker: speaker,
               flavor: flavor
           }, { rollMode });
           rolled = true;
           return roll
       }

       return _roll(event);
   }
}
