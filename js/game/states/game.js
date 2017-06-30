'use strict'
var _ = require('lodash')

var game = {},
  map, background, foreground, top, blocked, character, dragon1, dragonsNextLocation, dragonsLocationX = 1724, dragonsLocationY = 224,
  flag, canKick,
  ballDuration = 2550,
  speed = 500,
  ballDistance = 800,
  maxWindUp = 2000,
  keyK, keyP, keyB, keyN, keyM, keyUp, keyRight, keyDown, keyLeft, keyEsc, escAim, cavehole, golfball, dottedline,
  kickPercentage, treeLocations,
  golfballCollision = true,
  chipKickUi, chipKickUi2, stanceUi, puttKickUi, mask, strokeUiText, blurX, blurY, blurOn = false,
  fillPercent = 0,
  fillColor = { r: 255, g: 0, b: 0 },
  sillhouetteColor = { r: 0, g: 0, b: 0 },
  currentSpriteUi, youWin = false, stroke = 0, par = 4, cameraFollow = true

function shake () {
  fillPercent = 100
  setFillPercent(100, currentSpriteUi)
  game.camera.shake(0.0025, 100)
}

function isTouching () {
  golfball.body.stopVelocityOnCollide = false
  if (golfball.body.velocity.x === 0 && golfball.body.velocity.y === 0 && escAim === false) {
    canKick = true
    setForTeeing(character)
  }
}

function ballInHole () {
  var text = {}, style = {}, msg, camX, camY
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
      msg = 'Bogie'
      break

    case par + 2:
      msg = 'Double Bogie'
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

  game.time.events.add(Phaser.Timer.SECOND * 3, function () { text.destroy() }, this)
}

function strokeCounter () {
  if (youWin === false) {
    stroke++
    strokeUiText.setText('Stroke ' + stroke)
  }
}
function setForTeeing (char) {
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

function escapeAiming () {
  escAim = true

  if (canKick === true) {
    if (character.animations.frame === 27) {
      character.x -= 15
    } else if (character.animations.frame === 9) {
      character.x += 15
    }
  }
}

function kick (key) {
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

function chipKick (ballDuration) {
  golfballCollision = false
  game.world.bringToTop(golfball)
  var chipTween = game.add.tween(golfball.scale)
  chipTween.to({ x: 2, y: 2 }, ballDuration, Phaser.Easing.Linear.InOut)
  chipTween.onComplete.addOnce(chipEnd, this)
  chipTween.start()
}

function chipEnd () {
  golfballCollision = true
  game.world.sendToBack(golfball)
  game.world.moveUp(golfball)

  var chipTween = game.add.tween(golfball.scale)
  chipTween.to({ x: 1, y: 1 }, ballDuration, Phaser.Easing.Linear.Out)
  chipTween.start()
}

function toggleCurrentUi (sprite) {
  chipKickUi.maskedSprite.visible = false
  chipKickUi2.maskedSprite.visible = false
  stanceUi.maskedSprite.visible = false
  puttKickUi.maskedSprite.visible = false
  currentSpriteUi = sprite
  currentSpriteUi.maskedSprite.visible = true
}

function detectKick (key) {
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

function createUiMaskSprite (srcKey, w, h) {
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

function setFillPercent (percent, obj) {
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

function forEachPixel (pixel) {
    // processPixelRGB won't take an argument, so we've set our sillhouetteColor globally
  pixel.r = sillhouetteColor.r
  pixel.g = sillhouetteColor.g
  pixel.b = sillhouetteColor.b
  return pixel
}

function cameraTweenToHole (sec) {
  var holeDistance = game.physics.arcade.distanceBetween(golfball, cavehole)
  game.add.tween(game.camera).to({ y: cavehole.y - game.camera.height / 2, x: cavehole.x - game.camera.width / 2 }, holeDistance, Phaser.Easing.Out, true)
  game.time.events.add(Phaser.Timer.SECOND * sec, function () { cameraFollow = true }, this)
}

function test (e) {
  dragonCreep()
}

// returns an angle given two points
function angleBetweenPoints (p1, p2) {
  // angle in radians
  // var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x)

  // angle in degrees
  var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
  return angleDeg
}

// gets a list of x, y coordinates of every tree of one type
function getTrees () {
  var treeList = [],
    tile,
    treeXY = {},
    i = 0,
    j = 0

    // loop through map object, counting tiles with an index of 92 (one of the tree tiles)
  _.forEach(map.layers[1].data, function (val) {
    _.forEach(val, function (data) {
      if (data.index === 92) { j++ }
    })
  })

  // iterate over list of tiles, constructing x,y coordinates
  for (i = 0; i < j; i++) {
    treeXY = {}
    tile = map.searchTileIndex(92, i, false, 'Foreground')
    treeXY.x = tile.x * 32 + _.random(0, 100); treeXY.y = tile.y * 32 + _.random(0, 100)
    treeList.push(treeXY)
  }

  return treeList
}

// returns an appropriate facing direction based on angle
function directionFromAngle (angleDeg) {
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

function dragonCreep () {
  var treeRandomIndex = game.rnd.integerInRange(0, treeLocations.length - 1)
  var treeIndex = treeRandomIndex
  var tree = treeLocations[treeIndex]
  var angleDeg = angleBetweenPoints(tree, dragon1)

  dragon1.animations.play(directionFromAngle(angleDeg), true)

  var randomDuration = game.rnd.integerInRange(1000, 5000)
  var move1 = makeSpriteTween(dragon1, randomDuration, treeLocations[treeIndex].x, treeLocations[treeIndex].y)
  move1.onComplete.add(function () { dragon1.animations.stop() }, this)
  move1.start()
}

function dragonPatrol () {
  var randomDuration = game.rnd.integerInRange(1000, 5000)
  var move1 = makeSpriteTween(dragon1, randomDuration, 50, 40)
  var move2 = makeSpriteTween(dragon1, randomDuration, 50, 400)
  var move3 = makeSpriteTween(dragon1, randomDuration, 500, 400)
  var move4 = makeSpriteTween(dragon1, randomDuration, 1291, 224)

  dragon1.animations.play('left', true)
  move1.onComplete.add(function () { dragon1.animations.play('down', true) }, this)
  move2.onComplete.add(function () { dragon1.animations.play('right', true) }, this)
  move3.onComplete.add(function () { dragon1.animations.play('right', true) }, this)
  move4.onComplete.add(function () { dragon1.animations.play('left', true) })

  move1.chain(move2)
  move2.chain(move3)
  move3.chain(move4)
  move4.chain(move1)

  move1.start()
}

// wrapper for game.make.tween to make it a little easier to call
function makeSpriteTween (spriteName, spriteSpeed, spriteX, spriteY) {
  var sweetTween = game.make.tween(spriteName).to({x: spriteX, y: spriteY}, spriteSpeed, Phaser.Easing.Out)
  return sweetTween
}

function monsterPenalty () {
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

    game.time.events.add(Phaser.Timer.SECOND * 3, function () {
      dragon1.hasOverlapped = character.hasOverlapped = false
      blurX.blur = 0; blurY.blur = 0
      character.filters = [blurX, blurY]
    }, this)
  }
}

game.create = function () {
  game.physics.startSystem(Phaser.Physics.ARCADE)

  // add the map and set bounds. Turn on arcade physics so we can collide with boundaries
  map = game.add.tilemap('map')
  game.world.setBounds(0, 0, 3200, 3200)

    // the first parameter is the name given in Tiled, second is the cache name given in preloader.js
  map.addTilesetImage('grass-tiles-2-small', 'grass')
  map.addTilesetImage('tree2-final', 'tree')
  treeLocations = getTrees()

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

  strokeUiText = game.add.text(game.camera.width - 225, game.camera.height - 15, 'Stroke ' + stroke, { font: '25px Arial', fill: '#000000', align: 'center' })
  strokeUiText.fixedToCamera = true
  strokeUiText.anchor.set(0.5)
  strokeUiText.inputEnabled = true
  

  game.time.events.loop(Phaser.Timer.SECOND * 12, dragonCreep, this)
}

game.update = function () {
  canKick = false
  dottedline.visible = false
  dottedline.x = golfball.x
  dottedline.y = golfball.y

    // dragonMove()

  game.physics.arcade.collide(character, blocked)
  game.physics.arcade.collide(golfball, dragon1, function () { dragon1.destroy() })
  game.physics.arcade.overlap(character, dragon1, monsterPenalty)

  if (golfballCollision === true) {
    game.physics.arcade.collide(golfball, blocked)
    game.physics.arcade.overlap(golfball, cavehole, ballInHole)
  }
  game.physics.arcade.overlap(character, golfball, isTouching)

    // game.camera.y = cavehole.y - game.camera.height/2
    // game.camera.x = cavehole.x - game.camera.width/2
    // lock the camera on our sprite guy and follow
  if (cameraFollow === true) {
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
