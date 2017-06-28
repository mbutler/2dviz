'use strict'

var game = {},
    map, background, foreground, top, blocked, character, dragon1, dragonsNextLocation, dragonsLocationX = 1724, dragonsLocationY = 224, flag, canKick,
    ballDuration = 2550,
    speed = 500,
    ballDistance = 800,
    maxWindUp = 2000,
    keyK, keyP, keyB, keyN, keyM, keyUp, keyRight, keyDown, keyLeft, keyEsc, escAim, cavehole, golfball, dottedline,
    kickPercentage,
    golfballCollision = true,
    chipKickUi, chipKickUi2, stanceUi, puttKickUi, mask,
    fillPercent = 0,
    fillColor = { r: 255, g: 0, b: 0 },
    sillhouetteColor = { r: 0, g: 0, b: 0 },
    currentSpriteUi, youWin = false, stroke = 0, par = 4, cameraFollow = false

function shake() {
    fillPercent = 100
    setFillPercent(100, currentSpriteUi)
    game.camera.shake(0.0025, 100)
        /*    let rand = game.rnd.integerInRange(-2, 2)
            currentSpriteUi.maskedSprite.fixedToCamera = false
            origin = currentSpriteUi.maskedSprite.x
            console.log(currentSpriteUi.maskedSprite.x, game.camera.width - 75)

            currentSpriteUi.maskedSprite.x = origin + rand
            if (currentSpriteUi.maskedSprite.x < origin - 5 || currentSpriteUi.maskedSprite.x > origin + 5) {
                currentSpriteUi.maskedSprite.x = origin
            }*/
}

function isTouching() {
    golfball.body.stopVelocityOnCollide = false
    if (golfball.body.velocity.x === 0 && golfball.body.velocity.y === 0 && escAim === false) {
        canKick = true
        setForTeeing(character)
    }
}

function ballInHole() {
    var text = {}, style = {}, msg, camX, camY
    golfball.destroy()
    youWin = true
    var stroke = 3
    msg = 'YOU WIN!'
    if (par === stroke){
      msg = "Par"
    } else if(stroke === par + 1){
      msg = "Bogie"
    } else if(stroke === par + 2 ){
      msg = "Double Bogie"
    } else if(stroke === par - 1){
      msg = "Birdie"
    } else if(stroke === par - 2){
      msg = "Eagle"
    }

    style = { font: "bold 48px Arial", fill: "#ff0000", boundsAlignH: "center", boundsAlignV: "middle", stroke: "#000", strokeThickness: 4 }
            camX = (game.camera.width / 2) + game.camera.view.x
            camY = (game.camera.height / 2) + game.camera.view.y
            text = game.add.text(camX, camY - 75, msg, style)
            text.anchor.setTo(0.5, 0.5)

            game.time.events.add(Phaser.Timer.SECOND * 3, textDestroy, this)

      function textDestroy () {
          text.destroy();
      }
}

function strokeCounter(){
  if (youWin === false){
    stroke++
  }
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
    ballInHole()
}

function kick(key) {
    var calculatedDistance

    if (canKick === true) {
        kickPercentage = key.duration / maxWindUp


        if (kickPercentage > 1) {
            kickPercentage = 1
        }

        calculatedDistance = ballDistance * kickPercentage

        golfball.body.moveTo(ballDuration, calculatedDistance, dottedline.angle)
        strokeCounter()
        console.log(stroke)
        if (calculatedDistance > 800) {
            chipKick(calculatedDistance)
        }

        currentSpriteUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
        currentSpriteUi.maskedSprite.fixedToCamera = true
        fillPercent = 0
        setFillPercent(0, currentSpriteUi)

    }
}

function chipKick(ballDuration) {
    golfballCollision = false
    game.world.bringToTop(golfball)
    var chipTween = game.add.tween(golfball.scale)
    chipTween.to({ x: 2, y: 2 }, ballDuration, Phaser.Easing.Linear.InOut)
    chipTween.onComplete.addOnce(chipEnd, this)
    chipTween.start()
}

function chipEnd() {
    golfballCollision = true
    game.world.sendToBack(golfball)
    game.world.moveUp(golfball)

    var chipTween = game.add.tween(golfball.scale)
    chipTween.to({ x: 1, y: 1 }, ballDuration, Phaser.Easing.Linear.Out)
    chipTween.start()
}

function toggleCurrentUi(sprite) {
    chipKickUi.maskedSprite.visible = false
    chipKickUi2.maskedSprite.visible = false
    stanceUi.maskedSprite.visible = false
    puttKickUi.maskedSprite.visible = false
    currentSpriteUi = sprite
    currentSpriteUi.maskedSprite.visible = true
}

function detectKick(key) {
    switch (key.event.code) {
        case 'KeyB':
            ballDuration = 2550
            ballDistance = 400
            toggleCurrentUi(puttKickUi)
            break
        case 'KeyN':
            ballDuration = 2550
            ballDistance = 800
            toggleCurrentUi(chipKickUi)
            break
        case 'KeyM':
            ballDuration = 2550
            ballDistance = 1600
            toggleCurrentUi(chipKickUi2)
            break
        default:
            ballDuration = 2550
            ballDistance = 800
    }
}

function createUiMaskSprite(srcKey, w, h) {
    var bmd, fillBMD, maskedBMD, maskedSprite
    var obj = {}

    //make the bitmapdata sillouette from preloaded png file
    bmd = game.make.bitmapData()
    bmd.load(srcKey)
    bmd.processPixelRGB(forEachPixel, this)
    obj.sillhouetteBMD = bmd

    fillBMD = game.make.bitmapData(w, h)
    fillBMD.fill(fillColor.r, fillColor.g, fillColor.b, 1)
    maskedBMD = game.make.bitmapData(w, h)
    obj.fillBMD = fillBMD
    obj.maskedBMD = maskedBMD
    maskedSprite = game.add.sprite(0, 0, maskedBMD)
    obj.maskedSprite = maskedSprite
    obj.name = srcKey

    return obj
}

function setFillPercent(percent, obj) {
    //maskedBMD
    var w = obj.maskedBMD.width;
    var h = obj.maskedBMD.height
        // need to clear it, otherwise it stacks drawing and looks a mess
    obj.maskedBMD.clear()
        // fill from the bottom
    var fillY = h - ((percent / 100) * h)
        // this shifts the fill
    var srcRect = { x: 0, y: fillY, width: w, height: h }
    obj.maskedBMD.alphaMask(obj.fillBMD, obj.sillhouetteBMD, srcRect)
}

function forEachPixel(pixel) {
    // processPixelRGB won't take an argument, so we've set our sillhouetteColor globally
    pixel.r = sillhouetteColor.r
    pixel.g = sillhouetteColor.g
    pixel.b = sillhouetteColor.b
    return pixel
}

function cameraTweenToHole(sec){
  var holeDistance = game.physics.arcade.distanceBetween(golfball, cavehole)
  game.add.tween(game.camera).to( { y: cavehole.y - game.camera.height/2, x: cavehole.x - game.camera.width/2 }, holeDistance, Phaser.Easing.Out, true);
  game.time.events.add(Phaser.Timer.SECOND * sec, function (){cameraFollow = true}, this)
}

// function dragonMove(){
//   //1291, 224,
//
//   console.log(dragon1.x)
//   if (dragon1.x < 1721){
//     game.physics.arcade.moveToXY(dragon1, dragonsLocationX, dragonsLocationY, 60, 1000)
//     dragon1.animations.play("right")
//   }else if(dragon1.x >= 1723){
//     dragon1.animations.stop()
//      game.physics.arcade.moveToXY(dragon1, 1722, 800, 60, 1000)
//      dragon1.animations.play("down")
//   //   dragon1.body.velocity.x = 0
//   //   dragon1.body.velocity.y = 0
//   //   dragonsLocationY = 4000
//   //   dragon1.body.moveTo(dragonsLocationX, dragonsLocationY)
//    }
// }


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
    cavehole = game.add.sprite(3000, 3000, 'cavehole')
    cavehole.anchor.setTo(0.5, 0.5)
    golfball = game.add.sprite(500, 400, 'golfball')
    flag = game.add.sprite(cavehole.x, cavehole.y, 'flag')
    flag.anchor.setTo(0, 1)
    character = game.add.sprite(450, 100, 'characters')
    dragon1 = game.add.sprite(1291, 224, 'dragon1')
    dottedline = game.add.sprite(golfball.x + 40, golfball.y, 'dottedline')
    foreground = map.createLayer('Foreground')

    character.anchor.setTo(0.5, 0.5)
    golfball.anchor.setTo(0.5, 0.5)
    dottedline.anchor.setTo(0, 0.5)



    chipKickUi = createUiMaskSprite("chipKickUi", 75, 100)
    setFillPercent(0, chipKickUi)
    chipKickUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
    chipKickUi.maskedSprite.fixedToCamera = true
    chipKickUi.maskedSprite.visible = false

    puttKickUi = createUiMaskSprite("puttKickUi", 75, 100)
    setFillPercent(0, puttKickUi)
    puttKickUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
    puttKickUi.maskedSprite.fixedToCamera = true
    puttKickUi.maskedSprite.visible = false

    chipKickUi2 = createUiMaskSprite('chipKickUi2', 75, 100)
    chipKickUi2.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
    setFillPercent(0, chipKickUi2)
    chipKickUi2.maskedSprite.fixedToCamera = true
    chipKickUi2.maskedSprite.visible = false

    stanceUi = createUiMaskSprite('stanceUi', 75, 100)
    stanceUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
    setFillPercent(0, stanceUi)
    stanceUi.maskedSprite.fixedToCamera = true
    stanceUi.maskedSprite.visible = false

    currentSpriteUi = stanceUi
    console.log(currentSpriteUi.name)
    currentSpriteUi.maskedSprite.visible = true


    map.setCollisionBetween(1, 100, true, 'Blocked')
    map.setCollisionBetween(73, 127, true, 'Foreground')

    // enable the physics engine only for sprites that need them
    game.physics.arcade.enable(character, true)
    game.physics.arcade.enable(dragon1, true)
    game.physics.arcade.enable(golfball, true)
    game.physics.arcade.enable(cavehole, true)
    character.body.collideWorldBounds = true

    character.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true)
    character.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true)
    character.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true)
    character.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true)

    dragon1.animations.add('right', [8, 9, 10, 11], 20, true)
    dragon1.animations.add('left', [4, 5, 6, 7], 20, true)
    dragon1.animations.add('down', [0, 1, 2, 3], 20, true)
    dragon1.animations.add('up', [12, 13, 14, 15], 20, true)

    golfball.body.collideWorldBounds = true
    golfball.body.bounce.set(0.25)
    golfball.body.drag.setTo(70, 70)

    keyK = game.input.keyboard.addKey(Phaser.KeyCode.K)
    keyK.onUp.add(kick)

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

    cameraTweenToHole(6)

}

game.update = function() {
    canKick = false
    dottedline.visible = false
    dottedline.x = golfball.x
    dottedline.y = golfball.y

    //dragonMove()

    game.physics.arcade.collide(character, blocked)

    if (golfballCollision === true) {
        game.physics.arcade.collide(golfball, blocked)
    }
    game.physics.arcade.overlap(character, golfball, isTouching)
    game.physics.arcade.overlap(golfball, cavehole, ballInHole)

    //game.camera.y = cavehole.y - game.camera.height/2
    //game.camera.x = cavehole.x - game.camera.width/2
    // lock the camera on our sprite guy and follow
    if(cameraFollow === true){
    this.camera.follow(character, Phaser.Camera.FOLLOW_LOCKON)
    }

    character.body.velocity.x = 0
    character.body.velocity.y = 0

    if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
        if (canKick === true) {
            if (fillPercent < 100) {
                setFillPercent(fillPercent, currentSpriteUi)
                fillPercent = (fillPercent + 0.83) % 101
            } else if (fillPercent >= 100) {
                shake()
            }
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
