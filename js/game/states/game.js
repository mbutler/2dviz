var game = {};
var sprite1;
var speed = 4;
var map, background, foreground, top

game.create = function () {
  map = game.add.tilemap('map')
  
  //the first parameter is the name given in Tiled, second is the name given in preloader.js
  map.addTilesetImage('grass-tiles-2-small', 'grass');
  map.addTilesetImage('tree2-final', 'tree');
  
  //need to refer to these layers by the layer name in Tiled
  //add the character before the Foreground layer to make it look like he's walking behind
  background = map.createLayer('Background')
  top = map.createLayer('Top')    
  sprite1 = game.add.sprite(40, 100, 'characters')
  foreground = map.createLayer('Foreground') 
  
  sprite1.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 60, true)
  sprite1.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 60, true)
  sprite1.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 60, true)
  sprite1.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 60, true)
};

game.update = function(){
  // Check key states every frame.
  // Move ONLY one of the left and right key is hold.

  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
    sprite1.animations.play('left', true);
      sprite1.x -= speed;
      console.log(sprite1.x)
      //sprite1.angle = -15;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      sprite1.animations.play('right', true);
      sprite1.x += speed;
      console.log(sprite1.x)

      //sprite1.angle = 15;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
    sprite1.animations.play('down', true);
      sprite1.y += speed;
      console.log(sprite1.x)

  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
    sprite1.animations.play('up', true);
      sprite1.y -= speed;
      console.log(sprite1.x)

  }
  else
  {
      sprite1.animations.stop()
  }

}


module.exports = game;
