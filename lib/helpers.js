var fs         = require('fs');
var yaml       = require('js-yaml');
config         = yaml.safeLoad(fs.readFileSync('./site.yaml', 'utf8'));

module.exports = {
  uppercase : function(str) {
      return str.toUpperCase();
  },
  image: function(path) {
      return "/img/" + path + ".png";
  },
  text: function(key) {
      return config.text[key];
  },
  route: function(key) {
      return config.routes[key];
  },
  settings: function(key){
      return config.settings[key];
  }
}
