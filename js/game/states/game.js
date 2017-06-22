var game = {}
var speed = 500
var map, background, foreground, top, blocked, character

game.create = function () {
  game.physics.startSystem(Phaser.Physics.ARCADE)

  //add the map and set bounds. Turn on arcade physics so we can collide with boundaries
  map = game.add.tilemap('map')
  game.world.setBounds(0, 0, 3200, 3200)

  //the first parameter is the name given in Tiled, second is the cache name given in preloader.js
  map.addTilesetImage('grass-tiles-2-small', 'grass')
  map.addTilesetImage('tree2-final', 'tree')
  map.addTilesetImage('red', 'red')

  //need to refer to these layers by the layer name in Tiled
  //add the character before the Foreground layer to make it look like he's walking behind
  background = map.createLayer('Background')
  blocked = map.createLayer('Blocked')
  blocked.visible = false
  top = map.createLayer('Top')
  character = game.add.sprite(40, 100, 'characters')
  golfball = game.add.sprite(45, 100, 'golfball')
  foreground = map.createLayer('Foreground')

  map.setCollisionBetween(1, 100, true, 'Blocked')

  //enable the physics engine only for sprites that need them
  game.physics.arcade.enable(character, true)
  game.physics.arcade.enable(golfball, true)
  character.body.collideWorldBounds = true

  character.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true)
  character.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true)
  character.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true)
  character.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true)

  golfball.body.velocity.setTo(100,300)
  golfball.body.collideWorldBounds = true
  golfball.body.bounce.set(0.25)

}

function isTouching () {
  console.log("yep, touching")
}

game.update = function(){
  game.physics.arcade.collide(character, blocked)
  game.physics.arcade.collide(golfball, blocked)
  game.physics.arcade.overlap(character, golfball, isTouching)
  golfball.body.drag.x = 50
  golfball.body.drag.y = 50


  //lock the camera on our sprite guy and follow
  this.camera.follow(character, Phaser.Camera.FOLLOW_LOCKON)

  character.body.velocity.x = 0
  character.body.velocity.y = 0

  // Check key states every frame.
  // Sprites need a velocity to work with physics
  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      character.animations.play('left', true)
      character.body.velocity.x -= speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      character.animations.play('right', true)
      character.body.velocity.x += speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      character.animations.play('down', true)
      character.body.velocity.y += speed
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      character.animations.play('up', true)
      character.body.velocity.y -= speed
  }
  else {
      character.animations.stop()
      character.body.velocity.x = 0
      character.body.velocity.y = 0
  }
}

module.exports = game
