let game;
let levelData = [];
let polygon;
let polygons = [];
let startGame = false;
var menu;
let maxxdaddy;
let title;
let titleShadow;
let levelMarkerData = [];
let text = [];
let currentLevel = 0;
let levelBuilt = false;
let polys = [];
let target = 0;
let completed = 0;
let textIsShowing = false;
let lvlText;
let sliceText;
let targetText;
let removedText;
let slicesLeft = 3;
let totalMass = 0;
let removed = 0;
let popup;
let rectGraphics;
let popupTitle;
let tryAgain;
let tryNext;
let goToMenu;
let levelCompleted = false;
let width = 0;
let height = 0;
let rect;
let polyFill;
let polyGroup = [];

const colorSwitch = color =>
  ({
    red: '0xff0000',
    blue: '0x0000ff',
    white: '0xffffff',
    black: '0x000000',
  } [color]);
const textFormat = {
  fontFamily: 'Arial',
  fontStyle: 'Bold',
  fontSize: 16,
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 6,
};
window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'thegame',
      width: 640,
      height: 480,
    },
    scene: playGame,
    physics: {
      default: 'matter',
      matter: {
        gravity: {
          y: 1,
        },
        debug: false,
      },
    },
  };
  game = new Phaser.Game(gameConfig);
  window.focus();
};
class playGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  preload() {
    this.showLoader(this);
    this.load.json('levelData', 'assets/json/map1.json');
    this.load.image('do_over', 'assets/images/do_over.png');
    this.load.image('go_back', 'assets/images/go_back.png');
    this.load.image('level_marker', 'assets/images/level_marker.png');
    this.load.image('play_button', 'assets/images/play_button.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('titleShadow', 'assets/images/titleShadow.png');
    this.load.image('maxxdaddy', 'assets/images/maxxdaddy.gif');
  }

  showLoader(game) {
    var progressBar = game.add.graphics();
    var progressBox = game.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(340, 270, 320, 50);
    game.load.on('progress', function (value) {});

    game.load.on('fileprogress', function (file) {});

    game.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    game.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xff4500, 1);
      progressBar.fillRect(350, 280, 300 * value, 30);
      percentText.setText(parseInt(value * 100) + '%');
    });

    var width = game.cameras.main.width;
    var height = game.cameras.main.height;
    var loadingText = game.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    var percentText = game.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
  }

  create() {
    width = this.game.config.width;
    height = this.game.config.height;
    this.cameras.main.setBackgroundColor(0x666666);
    let data = this.cache.json.get('levelData').levels;
    for (let index = 0; index < data.length; index++) {
      var level = {
        scoreTargets: [],
        polygons: [],
      };
      level.level = data[index][0];

      for (var i = 1; i < 4; i++) {
        level.scoreTargets.push(data[index][i]);
      }
      target = level.scoreTargets[0];

      for (var i = 4; i < data[index].length; i++) {
        var poly = {
          startX: data[index][i][0],
          startY: data[index][i][1],
          width: data[index][i][2],
          height: data[index][i][3],
          angle: data[index][i][4],
          dynamic: data[index][i][5],
          type: data[index][i][6],
          anchorX: data[index][i][7],
          anchorY: data[index][i][8],
          anchorZ: data[index][i][9],
          color: data[index][i][10],
          coordinates: data[index][i][11],
        };
        level.polygons.push(poly);
      }
      levelData.push(level);
    }
    this.buildMenu();
    this.levelOverPopup();
    //maxxdaddy = this.add.image(this.game.config.width * 0.9, this.game.config.height * 0.95, 'maxxdaddy');
  }

  startDrawing() {
    if (slicesLeft == 0) {
      levelCompleted = true;
      removed >= target ? this.showPopup(true, true) : this.showPopup(false, true);
    } else
      this.isDrawing = true;
  }

  keepDrawing(pointer) {
    if (this.isDrawing) {
      this.lineGraphics.clear();
      this.lineGraphics.lineStyle(2, 0x00);
      this.lineGraphics.moveTo(pointer.downX, pointer.downY);
      this.lineGraphics.lineTo(pointer.x, pointer.y);
      this.lineGraphics.strokePath();
      this.lineGraphics.depth = 1;
    }
  }

  stopDrawing(pointer) {
    if (!this.isDrawing)
      return;
    this.lineGraphics.clear();
    this.isDrawing = false;
    let bodies = this.matter.world.localWorld.bodies;
    let toBeSliced = [];
    let toBeCreated = [];
    for (let i = 0; i < bodies.length; i++) {
      let body = bodies[i];
      if (!body.isStatic) {
        let vertices = body.parts[0].vertices;
        let pointsArray = [];
        vertices.forEach(function (vertex) {
          pointsArray.push(vertex.x, vertex.y);
        });
        let slicedPolygons = PolyK.Slice(
          pointsArray,
          pointer.downX,
          pointer.downY,
          pointer.upX,
          pointer.upY,
        );
        let bodyColor = body.gameObject.fillColor;
        if (slicedPolygons.length > 1) {
          toBeSliced.push(body);
          slicedPolygons.forEach(function (points) {
            toBeCreated.push(points.concat(bodyColor));
          });
        }
      }
    }
    if (toBeSliced.length > 0)
      slicesLeft--;
    toBeSliced.forEach(
      function (body) {
        body.gameObject.destroy();
        this.matter.world.remove(body);
      }.bind(this),
    );
    toBeCreated.forEach(
      function (points) {
        let polyObject = [];
        polyFill = points[points.length - 1];
        points.pop();
        for (let i = 0; i < points.length / 2; i++) {
          polyObject.push({
            x: points[i * 2],
            y: points[i * 2 + 1],
          });
        }

        let sliceCentre = Phaser.Physics.Matter.Matter.Vertices.centre(
          polyObject,
        );
        var verts = this.matter.verts.fromPath(points.join(' '));
        for (let i = 0; i < verts.length; i++) {
          (verts[i].x -= sliceCentre.x) * -1;
          (verts[i].y -= sliceCentre.y) * -1;
        }
        var poly = this.add.polygon(
          sliceCentre.x,
          sliceCentre.y,
          verts,
          polyFill,
        );
        poly.setStrokeStyle(2, 0x00);
        polyGroup.push(poly);
        this.matter.add
          .gameObject(poly, {
            shape: {
              type: 'fromVerts',
              verts,
              flagInternal: true,
            },
          })
          .setOrigin(0, 0);
        // console.log(body);
      }.bind(this),
    );
  }

  update() {
    // startGame = true;
    // currentLevel = 2;
    if (!startGame) {
      this.showMenu(true);
      return;
    }
    lvlText == null ? this.statusText() : this.updateStatus();
    if (!levelBuilt) {
      //this.matter.world.setBounds(10, 10, game.config.width - 20, game.config.height - 20);
      this.buildLevel(currentLevel);
    }
    if (levelCompleted)
      return;
    let bodies = this.matter.world.localWorld.bodies;
    const curLvl = levelData[currentLevel - 1];
    for (let i = 0; i < bodies.length; i++) {
      let body = bodies[i];
      const obj = body.gameObject;
      // if (obj.fillColor == "0xff0000" || obj.fillColor == "0xff0000" == "0xffffff") {
      //   body.force.y += body.mass * 0.001;
      // } else if (obj.fillColor == "0x0000ff") {
      //   body.force.y -= body.mass * 0.001;
      // }
      //           console.log(obj.y);
      if (obj.y > 800 || obj.y < -300) {
        if (obj.fillColor == "0xff0000")
          removed += (body.mass / totalMass) * 100;
        body.destroy();
        if (removed >= 99)
          removed = 100;
        this.updateStatus(true);
      }
      //console.log(obj.fillColor,Math.floor(body.velocity.x),Math.floor(body.velocity.y));
      if (removed >= target) { // && this.allPiecesSleeping()){
        levelMarkerData[currentLevel - 1].percent = Math.floor(removed);
        levelMarkerData[currentLevel].unlocked = true;
        levelCompleted = true;
        this.showPopup(true, true);
      }
      // if (slicesLeft == 0 && removed < target){//  && this.allPiecesSleeping()){
      //     levelCompleted = true;
      //     this.showPopup(false, true);
      // }
    }
  }

  allPiecesSleeping() {
    let retValue = true;
    let bodies = this.matter.world.localWorld.bodies;
    for (let i = 0; i < bodies.length; i++) {
      if (!bodies[i].isSleeping && !bodies[i].isStatic) {
        retValue = false;
      }
    }
    return retValue;
  }

  updateStatus() {
    lvlText.setText('Level:' + currentLevel);
    sliceText.setText('Slices Left:' + slicesLeft);
    targetText.setText('Target:' + target + '%');
    removedText.setText('Removed:' + Math.floor(removed) + '%');
  }

  showStatus(onOff) {
    lvlText.visible = onOff;
    lvlText.depth = 1;
    sliceText.visible = onOff;
    sliceText.depth = 1;
    targetText.visible = onOff;
    targetText.depth = 1;
    removedText.visible = onOff;
    removedText.depth = 1;
  }

  statusText() {
    lvlText = this.add.text(10, 10, 'Level:' + currentLevel, textFormat);

    sliceText = this.add.text(
      this.game.config.width - 120,
      10,
      'Slices Left:' + slicesLeft,
      textFormat,
    );

    targetText = this.add.text(
      10,
      this.game.config.height - 50,
      'Target:' + target + '%',
      textFormat,
    );

    removedText = this.add.text(
      this.game.config.width - 120,
      this.game.config.height - 50,
      'Removed:' + Math.floor(removed) + '%',
      textFormat,
    );
  }

  levelSelected(x, y) {
    startGame = true;
    currentLevel = x + (y - 1) * 5;
    levelBuilt = false;
    this.showMenu(false);
  }

  getLevel(x, y) {
    return x + (y - 1) * 5;
  }

  clearBodies() {
    for (let index = 0; index < polyGroup.length; index++) {
      polyGroup[index].visible = false;
    }
    let bodies = this.matter.world.localWorld.bodies;
    for (let index = 0; index < bodies.length; index++) {
      let body = bodies[index];
      body.gameObject.visible = false;
      //if (body.gameObject != null)
      body.gameObject.destroy();
      body.visible = false;
      this.matter.world.remove(body);
    }

    while (polyGroup.length > 0) {
      polyGroup.pop();
    }
    while (bodies.length > 0) {
      bodies.pop();
    }
  }

  buildLevel(currentLevel) {
    this.cameras.main.setBackgroundColor(0xcccccc);
    //this.matter.world.setBounds();
    const curLvl = levelData[currentLevel - 1];
    const curPolys = curLvl.polygons;
    for (let index = 0; index < curPolys.length; index++) {
      var path = curPolys[index].coordinates;

      var verts = this.matter.verts.fromPath(path);

      var poly = this.add.polygon(
        curPolys[index].startX,
        curPolys[index].startY,
        verts,
        colorSwitch(curPolys[index].color),
      );
      poly.setStrokeStyle(2, 0x00);
      polyGroup.push(poly);
      // console.log(poly);
      var body = this.matter.add
        .gameObject(poly, {
          shape: {
            type: 'fromVerts',
            verts,
            flagInternal: true,
            density: 5,
            friction: 1,
            frictionAir: 1,
            frictionStatic: 1,
            restitution: 0
          },
        })
        .setStatic(!curPolys[index].dynamic)

      var angle = Phaser.Math.RadToDeg(curPolys[index].angle);

      body.angle = angle;
      this.matter.world.update30Hz();
      this.lineGraphics = this.add.graphics();
      this.input.on('pointerdown', this.startDrawing, this);
      this.input.on('pointerup', this.stopDrawing, this);
      this.input.on('pointermove', this.keepDrawing, this);
      this.isDrawing = false;
      if (body.fillColor == '0xff0000')
        totalMass += body.body.mass;
    }
    target = curLvl.scoreTargets[0];
    this.showStatus(true);
    levelBuilt = true;
  }

  showMenu(onOff) {
    this.cameras.main.setBackgroundColor(0x666666);
    menu.visible = onOff;
    if (!onOff) {
      for (let index = 0; index < text.length; index++) {
        text[index].destroy();
      }
      textIsShowing = false;
      return;
    }
    if (textIsShowing)
      return;
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 5; x++) {
        let offset = 0;
        let offset2 = 0;
        let i = this.getLevel(x, y) - 1;
        let val = levelMarkerData[i].level;
        if (val > 9)
          offset = -8;
        if (levelMarkerData[i].unlocked) {
          var lvlText = this.add.text(
            levelMarkerData[i].x - 25 + offset,
            levelMarkerData[i].y - 30,
            levelMarkerData[i].level, {
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#ffffff',
            },
          );
          val = levelMarkerData[i].percent;
          if (val > 9)
            offset2 = -8;
          if (val > 99)
            offset2 = -16;
          var lvlText2 = this.add.text(
            levelMarkerData[i].x - 25 + offset2,
            levelMarkerData[i].y,
            val + '%', {
              fontFamily: 'Arial',
              fontSize: 16,
              color: '#ffffff',
            },
          );
          text.push(lvlText);
          text.push(lvlText2);
        }
      }
    }
    textIsShowing = true;
  }

  levelOverPopup() {
    rect = new Phaser.Geom.Rectangle(width - 200, height / 2 - 100, 200, 200);
    var pfColor = 0x00CC05;

    rectGraphics = this.add.graphics({
      fillStyle: {
        color: pfColor
      }
    });

    rectGraphics.fillRectShape(rect).setVisible(false);

    popupTitle = this.add.text(rect.x + 20, rect.y + 30, 'LEVEL COMPLETED!', textFormat).setVisible(false);

    tryAgain = this.add.text(rect.x + 30, rect.y + 70, 'Retry', textFormat)
      .setInteractive()
      .on('pointerdown', () => this.retryLevel())
      .setVisible(false);
    tryNext = this.add.text(rect.x + 30, rect.y + 100, 'Next', textFormat)
      .setInteractive()
      .on('pointerdown', () => this.nextLevel())
      .setVisible(false);
    goToMenu = this.add.text(rect.x + 30, rect.y + 130, 'Go To Menu', textFormat)
      .setInteractive()
      .on('pointerdown', () => this.goToMenu())
      .setVisible(false);
  }

  showPopup(passFail, isVisible) {
    var pfColor = passFail ? 0x00CC05 : 0xff0000;
    rectGraphics.clear();
    rectGraphics = this.add.graphics({
      fillStyle: {
        color: pfColor
      }
    });

    rectGraphics.fillRectShape(rect);
    rectGraphics.setVisible(isVisible);
    //rectGraphics.tint = pfColor;
    tryAgain.setVisible(isVisible);
    tryAgain.depth = 1;
    popupTitle.setVisible(isVisible);
    popupTitle.depth = 1;
    popupTitle.setText(passFail ? 'LEVEL COMPLETED!' : 'FAILED LEVEL');
    tryNext.setVisible(passFail ? isVisible : false);
    tryNext.depth = 1;
    goToMenu.setVisible(isVisible);
    goToMenu.depth = 1;
  }

  retryLevel() {
    this.resetWorld();
    this.showPopup(true, false);
    this.buildLevel(currentLevel);
  }

  nextLevel() {
    this.resetWorld();
    this.showPopup(true, false);
    currentLevel++;
    this.buildLevel(currentLevel);
  }

  goToMenu() {
    this.showStatus(false);
    this.resetWorld();
    this.showPopup(true, false);
    this.showMenu(true);
  }

  resetWorld() {
    levelCompleted = false;
    slicesLeft = 3;
    removed = 0;
    totalMass = 0;
    this.clearBodies();
  }

  buildMenu() {
    titleShadow = this.add
      .image(325, 55, 'titleShadow')
      .setScale(0.3)
      .setOrigin(0.5, 0.5);
    title = this.add
      .image(320, 50, 'title')
      .setScale(0.3)
      .setOrigin(0.5, 0.5);
    let i = 1;
    let lvlButtons = [];
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 5; x++) {
        const lvlButton = this.add
          .image(x * 105, y * 100 + 30, 'level_marker')
          .setScale(0.4)
          .setOrigin(0.5, 0.5)
          .setInteractive()
          .on('pointerdown', () => this.levelSelected(x, y));
        lvlButtons.push(lvlButton);
        var levelMarker = {
          level: i,
          x: x * 105 + 20,
          y: y * 100 + 30,
          unlocked: false,
          percent: 0,
        };
        levelMarkerData.push(levelMarker);
        if (levelMarker.level < 2)
          levelMarker.unlocked = true;
        i++;
      }
    }
    menu = this.add.container(0, 0); //, [titleShadow, title, lvlButtons, levelMarkerData]);
    menu.add(titleShadow);
    menu.add(title);
    menu.add(lvlButtons);
    menu.visible = false;
  }
}