export class DiceQuest {
  // async rollGeneric(options = {}) {
  //   const roll = new Roll('1d20').roll();
  //   let isTriumph = false;
  //   let isSuccess = false;
  //   let isToughChoice = false;
  //   let isFailure = false;
  //   let isCatastrophe = false;
  //   if (roll.total === 20) {
  //     isTriumph = true;
  //   } else if (roll.total < 20 && roll.total >= 10) {
  //     isSuccess = true;
  //   } else if (roll.total < 11 && roll.total >= 5) {
  //     isToughChoice = true;
  //   } else if (roll.total < 6 && roll.total >= 2) {
  //     isFailure = true;
  //   } else if (roll.total === 1) {
  //     isCatastrophe = true;
  //   }
  //   const rollData = {
  //     actor: options.actor,
  //     roll: roll,
  //     isTriumph: isTriumph,
  //     isSuccess: isSuccess,
  //     isToughChoice: isToughChoice,
  //     isFailure: isFailure,
  //     isCatastrophe: isCatastrophe
  //   };
  //   const template = 'systems/quest/templates/chat/generic-card.html';
  //   const html = await renderTemplate(template, rollData);
  //   const chatData = {
  //     event: options.event,
  //     user: game.user._id,
  //     type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  //     content: html,
  //     speaker: {
  //       actor: options.actor._id
  //     }
  //   };
  //   // Toggle default roll mode
  //   let rollMode = game.settings.get('core', 'rollMode');
  //   if (['gmroll', 'blindroll'].includes(rollMode)) chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
  //   if (rollMode === 'blindroll') chatData['blind'] = true;
  //   return ChatMessage.create(chatData);
  // }
  // async rollAbility(options = {}) {
  //   const ability = await getItem(options.abilityId, 'ability');
  //   const effect = ability.data.effects[options.effectId];
  //   let isTriumph = false;
  //   let isSuccess = false;
  //   let isToughChoice = false;
  //   let isFailure = false;
  //   let isCatastrophe = false;
  //   const roll = new Roll('1d20').roll();
  //   if (!effect) return;
  //   let resultFlavor = '';
  //   const ranges = effect.ranges;
  //   for (let r = 0; r < ranges.length; r++) {
  //     const range = ranges[r];
  //     if (range.min === range.max) {
  //       if (roll.total === range.max) {
  //         resultFlavor = TextEditor.decodeHTML(range.description.chat);
  //       }
  //     } else {
  //       if (roll.total <= range.max && roll.total >= range.min) {
  //         resultFlavor = TextEditor.decodeHTML(range.description.chat);
  //       }
  //     }
  //   }
  //   if (roll.total === 20) {
  //     isTriumph = true;
  //   } else if (roll.total < 20 && roll.total >= 10) {
  //     isSuccess = true;
  //   } else if (roll.total < 11 && roll.total >= 5) {
  //     isToughChoice = true;
  //   } else if (roll.total < 6 && roll.total >= 2) {
  //     isFailure = true;
  //   } else if (roll.total === 1) {
  //     isCatastrophe = true;
  //   }
  //   const rollData = {
  //     actor: options.actor,
  //     roll: roll,
  //     legendary: ability.data.legendary,
  //     resultFlavor: resultFlavor,
  //     abilityName: ability.name,
  //     isTriumph: isTriumph,
  //     isSuccess: isSuccess,
  //     isToughChoice: isToughChoice,
  //     isFailure: isFailure,
  //     isCatastrophe: isCatastrophe
  //   };
  //   const template = 'systems/quest/templates/chat/ability-roll-card.html';
  //   const html = await renderTemplate(template, rollData);
  //   const chatData = {
  //     event: options.event,
  //     user: game.user._id,
  //     type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  //     content: html,
  //     speaker: {
  //       actor: options.actor._id
  //     }
  //   };
  //   // Toggle default roll mode
  //   let rollMode = game.settings.get('core', 'rollMode');
  //   if (['gmroll', 'blindroll'].includes(rollMode)) chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
  //   if (rollMode === 'blindroll') chatData['blind'] = true;
  //   return ChatMessage.create(chatData);
  // }
}
