export async function preloadHandlebarsTemplates(): Promise<void> {
  const templatePaths = [
    'systems/quest/templates/actors/parts/actor-madlibs.html',
    'systems/quest/templates/actors/parts/actor-inventory.html',
    'systems/quest/templates/actors/parts/actor-abilities.html',
    'systems/quest/templates/actors/parts/actor-notes.html',
    'systems/quest/templates/actors/parts/actor-limited-madlibs.html',
    'systems/quest/templates/actors/parts/actor-limited-inventory.html',
    'systems/quest/templates/actors/parts/actor-limited-abilities.html'
  ];

  return loadTemplates(templatePaths);
}
