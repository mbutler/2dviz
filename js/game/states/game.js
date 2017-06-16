var game = {}
var character
var speed = 4
var map, background, foreground, top

game.create = function () {

  //add the map and set bounds. Turn on arcade physics so we can collide with boundaries
  map = game.add.tilemap('map')
  game.world.setBounds(0, 0, 3200, 3200)
  game.physics.startSystem(Phaser.Physics.ARCADE)
  
  //the first parameter is the name given in Tiled, second is the chache name given in preloader.js
  map.addTilesetImage('grass-tiles-2-small', 'grass')
  map.addTilesetImage('tree2-final', 'tree')
  
  //need to refer to these layers by the layer name in Tiled
  //add the character before the Foreground layer to make it look like he's walking behind
  background = map.createLayer('Background')
  top = map.createLayer('Top')    
  character = game.add.sprite(40, 100, 'characters')
  foreground = map.createLayer('Foreground')

  //enable the physics engine only for sprites that need them
  game.physics.arcade.enable(character, true)
  character.body.collideWorldBounds = true

  character.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 60, true)
  character.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 60, true)
  character.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 60, true)
  character.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 60, true)
}

game.update = function(){
  //lock the camera on our sprite guy and follow
  this.camera.follow(character, Phaser.Camera.FOLLOW_LOCKON) 

  // Check key states every frame.
  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      character.animations.play('left', true)
      character.x -= speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      character.animations.play('right', true)
      character.x += speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      character.animations.play('down', true)
      character.y += speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      character.animations.play('up', true)
      character.y -= speed
  }
  else {
      character.animations.stop()
  }
}



module.exports = game
