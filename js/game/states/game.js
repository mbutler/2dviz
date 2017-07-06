'use strict'
var _ = require('lodash')
//using phaser 2.6.2
var game = {},
    map,

    // layers
    foreground,//tiles that sprites can move under
    middleground,//scenery that isn't part of the background, e.g. tree stumps, rocks
    blocked,//sprites cannot move over
    background,//background is made up of cellular automata https://bitstorm.org/gameoflife/


    dragonsLocationX = 1724, dragonsLocationY = 224,//the dragon's starting location
    canKick,//boolean that determins if the player can kick, is set to true when isTouching is called
    ballDuration = 2550,//The duration of the movement, in ms.
    speed = 550,//character run speed
    ballDistance = 800, //The distance, in pixels, the Body will move, by default 800, changed by the "b,n,m" keys.
    maxWindUp = 2000,//max time allowed for kick wind up, currently 2 seconds
    keyK, keyP, keyB, keyN, keyM, keyUp, keyRight, keyDown, keyLeft, keyEsc, escAim, //keys
    cavehole, golfball, dottedline, flag, character, dragon1,//sprites
    kickPercentage,//is determined by how long the "kick" key is held down divided by the maxWindUp "time" of the move selected
    treeLocations,//array of tree locations pulled from tilesheet(currently 92), is where the dragon moves to
    golfballCollision = true,//switch that is turned to false when chipping the ball over blocked tiles
    chipKickUi, chipKickUi2, stanceUi, puttKickUi, currentSpriteUi, mask, strokeUiText,
    blurX, blurY, blurOn = false, //blur is for character penalty/injury
    fillPercent = 0,// used for powerUp meter
    fillColor = { r: 255, g: 0, b: 0 }, //used for powerUp meter
    sillhouetteColor = { r: 0, g: 0, b: 0 },
    youWin = false,//will trigger a message when turned to true, on ball overlap with hole
    stroke = 0,//incremented when the character touches the dragon, and when the character hits the ball
    par = 4,//increase or decrease to change difficulty
    cameraFollow = false//camera follow refers to the following the charcter, it is set to false by default to allow for camera move to hole

//camera shake on maxWindUp
function shake() {
    fillPercent = 100
    setFillPercent(100, currentSpriteUi)
    game.camera.shake(0.0025, 100)
}

//called when character and golfball overlap, stops the golfball velocity
function isTouching() {
    golfball.body.stopVelocityOnCollide = false//prevents character and golfball reattachment on short kicks
    if (golfball.body.velocity.x === 0 && golfball.body.velocity.y === 0 && escAim === false) {
        canKick = true
        setForTeeing(character)
    }
}
//called when ball and hole overlap, destroys the golfball and displays the message with the stroke value
function ballInHole() {
    var text = {},
        style = {},
        msg, camX, camY
    golfball.destroy()
    youWin = true
    msg = 'YOU WIN!'
    switch (stroke) {
        case 1:
            msg = 'Hole in one!'
            break

        case par:
            msg = 'Par'
            break

        case par + 1:
            msg = 'Bogey'
            break

        case par + 2:
            msg = 'Double Bogey'
            break

        case par - 1:
            msg = 'Birdie'
            break

        case par - 2:
            msg = 'Eagle'
            break

        default:
            msg = stroke - par + ' over par'
    }

    style = { font: 'bold 48px Arial', fill: '#ff0000', boundsAlignH: 'center', boundsAlignV: 'middle', stroke: '#000', strokeThickness: 4 }
    camX = (game.camera.width / 2) + game.camera.view.x
    camY = (game.camera.height / 2) + game.camera.view.y
    text = game.add.text(camX, camY - 75, msg, style)
    text.anchor.setTo(0.5, 0.5)

    game.time.events.add(Phaser.Timer.SECOND * 3, function() { text.destroy() }, this)
}

//called in kick() and/or monsterPenalty
function strokeCounter() {
    if (youWin === false) {
        stroke++
        strokeUiText.setText('Stroke ' + stroke)
    }
}

//called in isTouching, snaps the character sprite to the golfball sprite, with an appropriate offset
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

//called when "esc" is pressed, which then offsets the character 15px from the ball, to allow character to move freely
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

//calclates the kick distance, and sets the location for each kick UI that is selected
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

        if (calculatedDistance > 800) {
            chipKick(calculatedDistance)
        }

        //currentSpriteUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100) //delete if not found to be helpful
        //currentSpriteUi.maskedSprite.fixedToCamera = true //delete if not found to be helpful
        fillPercent = 0
        setFillPercent(0, currentSpriteUi)
    }
}

//called from kick, turns golfball collision off, and brings golfball to the top layer
function chipKick(ballDuration) {
    golfballCollision = false
    game.world.bringToTop(golfball)
    var chipTween = game.add.tween(golfball.scale)
    chipTween.to({ x: 2, y: 2 }, ballDuration, Phaser.Easing.Linear.InOut)
    chipTween.onComplete.addOnce(chipEnd, this)
    chipTween.start()
}

//is called onComplete of the chipTween animation, it restores golfball default collisioin and layer
function chipEnd() {
    golfballCollision = true
    game.world.sendToBack(golfball)
    game.world.moveUp(golfball)

    var chipTween = game.add.tween(golfball.scale)
    chipTween.to({ x: 1, y: 1 }, ballDuration, Phaser.Easing.Linear.Out)
    chipTween.start()
}

//called on detectKick(), sets all other kick UIs to invisible
function toggleCurrentUi(sprite) {
    chipKickUi.maskedSprite.visible = false
    chipKickUi2.maskedSprite.visible = false
    stanceUi.maskedSprite.visible = false
    puttKickUi.maskedSprite.visible = false
    currentSpriteUi = sprite
    currentSpriteUi.maskedSprite.visible = true
}

//called on specific key events, determines parameters for the golfball moveTo animation and toggles the kick UI
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

//reads in each png, and converts the pixel to bit map data which is then used to make a sprite
function createUiMaskSprite(srcKey, w, h) {
    var bmd, fillBMD, maskedBMD, maskedSprite
    var obj = {}
    // make the bitmapdata sillouette from preloaded png file
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

//called whenever we need to change the level of the powerUp meter
function setFillPercent(percent, obj) {
    // maskedBMD
    var w = obj.maskedBMD.width
    var h = obj.maskedBMD.height
        // need to clear it, otherwise it stacks drawing and looks a mess
    obj.maskedBMD.clear()
        // fill from the bottom
    var fillY = h - ((percent / 100) * h)
        // this shifts the fill
    var srcRect = { x: 0, y: fillY, width: w, height: h }
    obj.maskedBMD.alphaMask(obj.fillBMD, obj.sillhouetteBMD, srcRect)
}

// processPixelRGB won't take an argument, so we've set our sillhouetteColor globally
function forEachPixel(pixel) {
    pixel.r = sillhouetteColor.r
    pixel.g = sillhouetteColor.g
    pixel.b = sillhouetteColor.b
    return pixel
}

//called in create, tied to a time event currently set at 1.5 seconds, opening camera move to show the user where the randomly generated hole is
function cameraTweenToHole() {
    var sec = 6
    var holeDistance = game.physics.arcade.distanceBetween(golfball, cavehole)
    game.add.tween(game.camera).to({ y: cavehole.y - game.camera.height / 2, x: cavehole.x - game.camera.width / 2 }, holeDistance, Phaser.Easing.Out, true)
    game.time.events.add(Phaser.Timer.SECOND * sec, function() { cameraFollow = true }, this)
}

//test function
function test(e) {
    console.log(getTileLocations(92, 'Foreground'))
}

// returns an angle given two points
function angleBetweenPoints(p1, p2) {
    // angle in radians
    // var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x)

    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
    return angleDeg
}

// get a Phaser Point object with coordinates at every instance of a particular tile
function getTileLocations(tileIndex, layer) {
    var tileList = [],
        tile,
        tileXY = {},
        i = 0,
        j = 0,
        mapLayer = _.find(map.layers, ['name', layer])

    // loop through map object, counting tiles with an index value
    _.forEach(mapLayer.data, function(val) {
        _.forEach(val, function(data) {
            if (data.index === tileIndex) { j++ }
        })
    })

    // iterate over list of tiles, constructing x,y coordinates
    for (i = 0; i < j; i++) {
        tileXY = new Phaser.Point()
        tile = map.searchTileIndex(tileIndex, i, false, layer)
        tileXY.set(tile.x * 32, tile.y * 32)
        tileList.push(tileXY)
    }

    return tileList
}

// returns an appropriate facing direction based on angle
function directionFromAngle(angleDeg) {
    if (_.inRange(angleDeg, 45, 136)) {
        return 'up'
    } else if (_.inRange(angleDeg, 135, 181) || _.inRange(angleDeg, -135, -180)) {
        return 'right'
    } else if (_.inRange(angleDeg, -44, -136)) {
        return 'down'
    } else if (_.inRange(angleDeg, -45, 46)) {
        return 'left'
    }
}

//called in create, animates the dragon sprite from random tree to random tree
function dragonCreep() {
    var treeRandomIndex = game.rnd.integerInRange(0, treeLocations.length - 1)//pulls a random index from the treeLocations array
    var i = treeRandomIndex
    var tree = treeLocations[treeRandomIndex]
    var angleDeg = angleBetweenPoints(tree, dragon1)

    dragon1.animations.play(directionFromAngle(angleDeg), true)

    var randomDuration = game.rnd.integerInRange(1000, 5000)
    var move1 = makeSpriteTween(dragon1, randomDuration, treeLocations[treeRandomIndex].x + _.random(0, 100), treeLocations[treeRandomIndex].y + _.random(0, 100))
    move1.onComplete.add(function() { dragon1.animations.stop() }, this)
    move1.start()
}
//manually entered animation path for dragon1 sprite
function dragonPatrol() {
    var randomDuration = game.rnd.integerInRange(1000, 5000)
    var move1 = makeSpriteTween(dragon1, randomDuration, 50, 40)
    var move2 = makeSpriteTween(dragon1, randomDuration, 50, 400)
    var move3 = makeSpriteTween(dragon1, randomDuration, 500, 400)
    var move4 = makeSpriteTween(dragon1, randomDuration, 1291, 224)

    dragon1.animations.play('left', true)
    move1.onComplete.add(function() { dragon1.animations.play('down', true) }, this)
    move2.onComplete.add(function() { dragon1.animations.play('right', true) }, this)
    move3.onComplete.add(function() { dragon1.animations.play('right', true) }, this)
    move4.onComplete.add(function() { dragon1.animations.play('left', true) }, this)

    move1.chain(move2)
    move2.chain(move3)
    move3.chain(move4)
    move4.chain(move1)

    move1.start()
}

// wrapper for game.make.tween to make it a little easier to call
function makeSpriteTween(spriteName, spriteSpeed, spriteX, spriteY) {
    var sweetTween = game.make.tween(spriteName).to({ x: spriteX, y: spriteY }, spriteSpeed, Phaser.Easing.Out)
    return sweetTween
}

//called when the dragon and the character overlap, causes blur and shake and flash, incremnts stroke counter
function monsterPenalty() {
    if (!character.hasOverlapped && !dragon1.hasOverlapped) {
        dragon1.hasOverlapped = character.hasOverlapped = true
        strokeCounter()
        game.camera.shake(0.0125, 1000)
        game.camera.flash(0xff0000, 500)

        blurX = game.add.filter('BlurX')
        blurY = game.add.filter('BlurY')

        blurX.blur = 32
        blurY.blur = 1

        character.filters = [blurX, blurY]

        game.time.events.add(Phaser.Timer.SECOND * 3, function() {
            dragon1.hasOverlapped = character.hasOverlapped = false
            blurX.blur = 0;
            blurY.blur = 0
            character.filters = [blurX, blurY]
        }, this)
    }
}

game.create = function() {
    //turns on the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)

    // add the map and set bounds. Turn on arcade physics so we can collide with boundaries
    map = game.add.tilemap('map')
    game.world.setBounds(0, 0, 3200, 3200) //sets world bounds in pixels

    // the first parameter is the name given in Tiled, second is the cache name given in preloader.js
    map.addTilesetImage('grass-tiles', 'grass')
    map.addTilesetImage('moretrees', 'moretrees')
    map.addTilesetImage('tree', 'tree')
    map.addTilesetImage('terrain_atlas', 'terrain_atlas')
    treeLocations = getTileLocations(92, 'Foreground')

    // need to refer to these layers by the layer name in Tiled and map.json
    // add the character before the Foreground layer to make it look like he's walking behind
    //specific order below, don't change it
    background = map.createLayer('Background')
    blocked = map.createLayer('Blocked')
    blocked.visible = false
    middleground = map.createLayer('Middleground')
    cavehole = game.add.sprite(_.random(200, 3000), _.random(200, 3000), 'cavehole')
    cavehole.anchor.setTo(0.5, 0.5)
    golfball = game.add.sprite(500, 400, 'golfball')
    flag = game.add.sprite(cavehole.x, cavehole.y, 'flag')
    flag.anchor.setTo(0, 1)
    character = game.add.sprite(450, 100, 'characters')
    dragon1 = game.add.sprite(1291, 224, 'dragon1')
    dottedline = game.add.sprite(golfball.x + 40, golfball.y, 'dottedline')
    foreground = map.createLayer('Foreground')

    character.anchor.setTo(0.5, 0.5)//anchors the character when he is setForTeeing
    golfball.anchor.setTo(0.5, 0.5)
    dottedline.anchor.setTo(0, 0.5)

    chipKickUi = createUiMaskSprite('chipKickUi', 75, 100)
    setFillPercent(0, chipKickUi)
    chipKickUi.maskedSprite.position.setTo(game.camera.width - 75, game.camera.height - 100)
    chipKickUi.maskedSprite.fixedToCamera = true
    chipKickUi.maskedSprite.visible = false

    puttKickUi = createUiMaskSprite('puttKickUi', 75, 100)
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
    currentSpriteUi.maskedSprite.visible = true

    map.setCollision(137, true, 'Blocked')//137 is the value of the red.png tile which can be found in map.json
    //map.setCollisionBetween(73, 127, true, 'Foreground') //delete if not found to be helpful

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

    //game.time.events.pause(Phaser.Timer.SECOND)

    game.time.events.add(1500, cameraTweenToHole, this)

    strokeUiText = game.add.text(game.camera.width - 225, game.camera.height - 15, 'Stroke ' + stroke, { font: '25px Arial', fill: '#000000', align: 'center' })
    strokeUiText.fixedToCamera = true
    strokeUiText.anchor.set(0.5)
    strokeUiText.inputEnabled = true

    game.time.events.loop(Phaser.Timer.SECOND * 12, dragonCreep, this)//timer that controls dragonCreep's firing

}

game.update = function() {
  // Check key states every frame.
  // Sprites need a velocity to work with physics



    canKick = false
    dottedline.visible = false
    dottedline.x = golfball.x
    dottedline.y = golfball.y

    game.physics.arcade.collide(character, blocked)
    game.physics.arcade.collide(golfball, dragon1, function() { dragon1.destroy() })//on collide the dragon is destoyed
    game.physics.arcade.overlap(character, dragon1, monsterPenalty)

    if (golfballCollision === true) {
        game.physics.arcade.collide(golfball, blocked)
        game.physics.arcade.overlap(golfball, cavehole, ballInHole)
    }
    game.physics.arcade.overlap(character, golfball, isTouching)

    if (cameraFollow === true) {
        this.camera.follow(character, Phaser.Camera.FOLLOW_LOCKON)
    }

    character.body.velocity.x = 0
    character.body.velocity.y = 0

    if (game.input.keyboard.isDown(Phaser.Keyboard.K)) { //if keyK is being held down, code block will loop
        if (canKick === true) {//if overlapping with ball
            if (fillPercent < 100) {// if it isn't fully poweredUp
                setFillPercent(fillPercent, currentSpriteUi)//sets the height of the UI sprite
                fillPercent = (fillPercent + 0.83) % 101 //calculation that syncs with the game's frame rate
            } else if (fillPercent >= 100) {//if it is full, then it shakes
                shake()
            }
        }
    }

//dottedline angles for hitting the ball, or if the character isn't overlapping the ball, it moves the character
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
        character.animations.stop()//stops the character if no input is being given
    }
}

module.exports = game
