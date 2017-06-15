var preloader = {};

preloader.preload = function () {
  this.game.load.spritesheet('characters', 'images/vx_characters.png', 64, 64, 32);
};

preloader.create = function () {
  this.game.state.start('game');
};

module.exports = preloader;
