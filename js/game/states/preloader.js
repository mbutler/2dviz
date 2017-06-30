var preloader = {}

preloader.preload = function() {
    this.game.load.spritesheet('characters', 'images/vx_characters.png', 64, 64, 32)
    this.game.load.spritesheet('dragon1', 'images/dragon1.png', 96, 96, 32)
    this.game.load.tilemap('map', 'images/map.json', null, Phaser.Tilemap.TILED_JSON)
    this.game.load.image('grass', 'images/grass-tiles-2-small.png')
    this.game.load.image('moretrees', 'images/moretrees.png')
    this.game.load.image('tree', 'images/tree2-final.png')
    this.game.load.image('cavehole', 'images/cavehole.png')
    this.game.load.image('dottedline', 'images/dottedline.png')
    this.game.load.image('golfball', 'images/golfball.png')
    this.game.load.image('chipKickUi', 'images/chip-kick.png')
    this.game.load.image('chipKickUi2', 'images/chip-kick-2.png')
    this.game.load.image('stanceUi', 'images/stance.png')
    this.game.load.image('puttKickUi', 'images/putt-kick.png')
    this.game.load.image('flag', 'images/flag.png')
    this.game.load.script('BlurX', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurX.js');
    this.game.load.script('BlurY', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/filters/BlurY.js');



}

preloader.create = function() {
    this.game.state.start('game')
}

module.exports = preloader
