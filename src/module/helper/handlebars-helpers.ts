export function registerHandlebarsHelpers(): void {
  Handlebars.registerHelper("breaklines", function (text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
    return new Handlebars.SafeString(text);
  });
}