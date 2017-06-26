'use strict'

var game = {}
var speed = 500
var map, background, foreground, top, blocked, character, canKick, ballDuration = 2550, ballDistance = 800, maxWindUp = 2000,
    keyK, keyP, keyB, keyN, keyM, keyUp, keyRight, keyDown, keyLeft, keyEsc, escAim, cavehole, golfball, dottedline,
    kickPercentage, golfballCollision = true, chipKickUi, chipKickUi2, stanceUi,  puttKickUi, mask, fillPercent = 0,
    fillColor = {r:255, g:0, b:0}, sillhouetteColor = {r:0, g:0, b:0}, sillhouetteBMD, fillBMD, maskedBMD, maskedSprite,
    sillhouetteGroup



function isTouching() {
    golfball.body.stopVelocityOnCollide = false
    if (golfball.body.velocity.x === 0 && golfball.body.velocity.y === 0 && escAim === false) {
        canKick = true
        setForTeeing(character)
    }
}

function ballInHole() {
    golfball.destroy()
    console.log('YOU WIN!')
}

function setForTeeing(char) {
    char.body.velocity.x = 0
    char.body.velocity.y = 0

    if (dottedline.angle < 90 && dottedline.angle > -90) {
        char.x = golfball.x - 25
        char.y = golfball.y - 25
        char.animations.frame = 27
    } else {
        char.x = golfball.x + 25
        char.y = golfball.y - 25
        char.animations.frame = 9
    }
}

function escapeAiming() {
    escAim = true

    if (canKick === true) {
        if (character.animations.frame === 27) {
            character.x -= 15
        } else if (character.animations.frame === 9) {
            character.x += 15
        }
    }
}

function test(e) {
    console.log(e)
}

function kick(key) {
    var calculatedDistance
    if (canKick === true) {
        kickPercentage = key.duration / maxWindUp


        if (kickPercentage > 1) {
            kickPercentage = 1
        }
        console.log(kickPercentage, fillPercent)
        calculatedDistance = ballDistance * kickPercentage

        golfball.body.moveTo(ballDuration, calculatedDistance, dottedline.angle)

        if (calculatedDistance > 800) {
          chipKick(calculatedDistance)
        }

    }
}

// function kickPowerUp(){
//   for (var i = 0; i < maxWindUp; i++) {
//     setFillPercent(fillPercent)
//     fillPercent = (fillPercent + i)%101
//   }
// }

function chipKick(ballDuration){
  golfballCollision = false
  game.world.bringToTop(golfball)
  var chipTween = game.add.tween(golfball.scale)
  chipTween.to({x: 2, y:2}, ballDuration, Phaser.Easing.Linear.InOut)
  chipTween.onComplete.addOnce(chipEnd, this)
  chipTween.start()
}

function chipEnd(){
  golfballCollision = true
  game.world.moveDown(golfball)
  var chipTween = game.add.tween(golfball.scale)
  chipTween.to({ x: 1, y: 1 }, ballDuration, Phaser.Easing.Linear.Out)
  chipTween.start()
}

function detectKick(key) {
    switch (key.event.code) {
        case 'KeyB':
            ballDuration = 2550
            ballDistance = 400
            chipKickUi2.visible = false
            chipKickUi.visible = false
            stanceUi.visible = false
            puttKickUi.visible = true
            break
        case 'KeyN':
            ballDuration = 2550
            ballDistance = 800
            chipKickUi2.visible = false
            chipKickUi.visible = true
            stanceUi.visible = false
            puttKickUi.visible = false
            break
        case 'KeyM':
            ballDuration = 2550
            ballDistance = 1600
            chipKickUi2.visible = true
            chipKickUi.visible = false
            stanceUi.visible = false
            puttKickUi.visible = false
            break
        default:
            ballDuration = 2550
            ballDistance = 800
    }
}

function createSillhouette(srcKey) {
	var bmd = game.make.bitmapData()
	// load our texture into the bitmap
	bmd.load(srcKey)
	bmd.processPixelRGB(forEachPixel, this)
  return bmd
}

function setFillPercent(percent) {
	var w = maskedBMD.width;
	var h = maskedBMD.height
	// need to clear it, otherwise it stacks drawing and looks a mess
	maskedBMD.clear()
	// fill from the bottom
	var fillY = h - ((percent/100)*h)
	// this shifts the fill
	var srcRect = {x:0, y:fillY, width:w , height:h}
	maskedBMD.alphaMask(fillBMD, sillhouetteBMD, srcRect)
}

function forEachPixel(pixel) {
  // processPixelRGB won't take an argument, so we've set our sillhouetteColor globally
	pixel.r = sillhouetteColor.r
	pixel.g = sillhouetteColor.g
	pixel.b = sillhouetteColor.b
	return pixel
}


game.create = function() {
    game.physics.startSystem(Phaser.Physics.ARCADE)
    //game.physics.arcade.gravity.x = 50

    // add the map and set bounds. Turn on arcade physics so we can collide with boundaries
    map = game.add.tilemap('map')
    game.world.setBounds(0, 0, 3200, 3200)

    // the first parameter is the name given in Tiled, second is the cache name given in preloader.js
    map.addTilesetImage('grass-tiles-2-small', 'grass')
    map.addTilesetImage('tree2-final', 'tree')

    // need to refer to these layers by the layer name in Tiled
    // add the character before the Foreground layer to make it look like he's walking behind
    background = map.createLayer('Background')
    blocked = map.createLayer('Blocked')
    blocked.visible = false
    top = map.createLayer('Top')
    cavehole = game.add.sprite(40, 400, 'cavehole')
    golfball = game.add.sprite(500, 400, 'golfball')
    character = game.add.sprite(450, 100, 'characters')
    dottedline = game.add.sprite(golfball.x, golfball.y, 'dottedline')

    character.anchor.setTo(0.5, 0.5)
    golfball.anchor.setTo(0.5, 0.5)
    dottedline.anchor.setTo(0, 0.5)

    foreground = map.createLayer('Foreground')

    chipKickUi = game.add.sprite(game.camera.width - 75, game.camera.height - 100, "chipKickUi")
    chipKickUi.fixedToCamera = true
    chipKickUi.visible = false

    chipKickUi2 = game.add.sprite(game.camera.width - 75, game.camera.height - 100, "chipKickUi2")
    chipKickUi2.fixedToCamera = true
    chipKickUi2.visible = false

    puttKickUi = game.add.sprite(game.camera.width - 75, game.camera.height - 100, "puttKickUi")
    puttKickUi.fixedToCamera = true
    puttKickUi.visible = false

    stanceUi = game.add.sprite(game.camera.width - 75, game.camera.height - 100, "stanceUi")
    //stanceUi.fixedToCamera = false
    stanceUi.visible = false

    sillhouetteBMD = createSillhouette('puttKickUi')    


    // this is the rectangle we will use to fill the sillhouette
    fillBMD = game.add.bitmapData(75, 100)
    fillBMD.fill(fillColor.r, fillColor.g, fillColor.b,1)
    maskedBMD = game.add.bitmapData(75, 100)

    // we need to set the initial mask
    setFillPercent(0)

    // let's create a sprite to show our masked bitmapdata
    maskedSprite = game.add.sprite(0,0,maskedBMD)
  	maskedSprite.position.set(game.camera.width - 75, game.camera.height - 100)
    map.setCollisionBetween(1, 100, true, 'Blocked')

    // enable the physics engine only for sprites that need them
    game.physics.arcade.enable(character, true)
    game.physics.arcade.enable(golfball, true)
    game.physics.arcade.enable(cavehole, true)
    character.body.collideWorldBounds = true

    character.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true)
    character.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true)
    character.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true)
    character.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true)

    golfball.body.collideWorldBounds = true
    golfball.body.bounce.set(0.25)
    golfball.body.drag.setTo(70, 70)

    keyK = game.input.keyboard.addKey(Phaser.KeyCode.K)
    keyK.onUp.add(kick)
    //keyK.onDown.add(kickPowerUp)

    keyP = game.input.keyboard.addKey(Phaser.KeyCode.P)
    keyP.onUp.add(test)

    // Move list
    keyB = game.input.keyboard.addKey(Phaser.KeyCode.B)
    keyB.onDown.add(detectKick)
    keyN = game.input.keyboard.addKey(Phaser.KeyCode.N)
    keyN.onDown.add(detectKick)
    keyM = game.input.keyboard.addKey(Phaser.KeyCode.M)
    keyM.onDown.add(detectKick)

    keyEsc = game.input.keyboard.addKey(Phaser.KeyCode.ESC)
    keyEsc.onDown.add(escapeAiming)
}

/*
 *
 * END OF CREATE FUNCTION
 *
 */

game.update = function() {
    canKick = false
    dottedline.visible = false
    dottedline.x = golfball.x
    dottedline.y = golfball.y

    game.physics.arcade.collide(character, blocked)

    if(golfballCollision === true){
      game.physics.arcade.collide(golfball, blocked)
    }
    game.physics.arcade.overlap(character, golfball, isTouching)
    game.physics.arcade.overlap(golfball, cavehole, ballInHole)

    // lock the camera on our sprite guy and follow
    this.camera.follow(character, Phaser.Camera.FOLLOW_LOCKON)

    character.body.velocity.x = 0
    character.body.velocity.y = 0

    if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
      if (fillPercent < 100) {
        setFillPercent(fillPercent)
        fillPercent = (fillPercent + 0.83) % 101
      }
    }
  // Check key states every frame.
    // Sprites need a velocity to work with physics
    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        if (canKick === true) {
            dottedline.visible = true
            dottedline.angle -= 1
        } else {
            escAim = false
            character.animations.play('left', true)
            character.body.velocity.x -= speed
        }
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        if (canKick === true) {
            dottedline.visible = true
            dottedline.angle += 1
        } else {
            escAim = false
            character.animations.play('right', true)
            character.body.velocity.x += speed
        }
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
        if (canKick === true) {
            character.body.velocity.y = 0
        } else {
            escAim = false
            character.animations.play('down', true)
            character.body.velocity.y += speed
        }
    } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
        if (canKick === true) {
            character.body.velocity.y = 0
        } else {
            escAim = false
            character.animations.play('up', true)
            character.body.velocity.y -= speed
        }
    } else {
        character.animations.stop()
    }
}

module.exports = game
