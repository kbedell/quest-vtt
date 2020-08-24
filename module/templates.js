/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

    // Define template paths to load
    const templatePaths = [
  
      // Actor Sheet Partials
      "systems/quest/templates/actors/parts/actor-madlibs.html",
      "systems/quest/templates/actors/parts/actor-inventory.html",
      "systems/quest/templates/actors/parts/actor-abilities.html",
      "systems/quest/templates/actors/parts/actor-limited-madlibs.html",
      "systems/quest/templates/actors/parts/actor-limited-inventory.html",
      "systems/quest/templates/actors/parts/actor-limited-abilities.html"
    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
  };