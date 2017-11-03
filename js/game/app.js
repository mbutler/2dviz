var _ = require('lodash');
var properties = require('./properties');

var states = {
  boot: require('./states/boot.js'),
  preloader: require('./states/preloader.js'),
  game: require('./states/game.js'),
  level2: require('./states/level2.js')
};

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game');

// Automatically register each state.
_.each(states, function(state, key) {
  game.state.add(key, state);
});

game.state.start('boot');
