var preloader = {};

preloader.preload = function () {
  this.game.world.setBounds(0, 0)

  this.game.load.spritesheet('characters', 'images/vx_characters.png', 64, 64, 32);
  this.game.load.tilemap('map', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
  this.game.load.image('grass', 'images/grass-tiles-2-small.png')
  this.game.load.image('tree', 'images/tree2-final.png')
};

preloader.create = function () {
  this.game.state.start('game');
};

module.exports = preloader;
