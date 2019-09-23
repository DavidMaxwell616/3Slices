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
let slices = 3;
let target = 0;
let completed = 0;
const colorSwitch = (color) => ({
  "red": "0xff0000",
  "blue": "0x0000ff",
  "white": "0xffffff",
  "black": "0x000000"
})[color]

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "thegame",
      width: 640,
      height: 480
    },
    scene: playGame,
    physics: {
      default: "matter",
      matter: {
        gravity: {
          y: 3
        },
        debug: true,
      }
    }
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}
class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    this.load.json('levelData', 'assets/map2.json');
    this.load.image('do_over', 'assets/images/do_over.png');
    this.load.image('go_back', 'assets/images/go_back.png');
    this.load.image('level_marker', 'assets/images/level_marker.png');
    this.load.image('play_button', 'assets/images/play_button.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('titleShadow', 'assets/images/titleShadow.png');
    this.load.image('maxxdaddy', 'assets/images/maxxdaddy.gif');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x666666);
    let data = this.cache.json.get('levelData').levels;
    for (let index = 0; index < data.length; index++) {
      var level = {
        level: index + 1,
        scoreTargets: [],
        polygons: []
      }

      for (var i = 0; i < 3; i++) {
        level.scoreTargets.push(data[index][i]);
      }

      for (var i = 3; i < data[index].length; i++) {
        var poly = {
          startX: data[index][i][0],
          startY: data[index][i][1],
          width: data[index][i][2],
          height: data[index][i][3],
          offset: data[index][i][4],
          dynamic: data[index][i][5],
          type: data[index][i][6],
          anchorX: data[index][i][7],
          anchorY: data[index][i][8],
          anchorZ: data[index][i][9],
          color: data[index][i][10],
          coordinates: data[index][i][11],
        }
        level.polygons.push(poly);
      }
      levelData.push(level);
    }
    this.buildMenu();
    //maxxdaddy = this.add.image(this.game.config.width * 0.9, this.game.config.height * 0.95, 'maxxdaddy');
  }

  startDrawing() {
    this.isDrawing = true;
  }

  keepDrawing(pointer) {
    if (this.isDrawing) {
      this.lineGraphics.clear();
      this.lineGraphics.lineStyle(1, 0x00ff00);
      this.lineGraphics.moveTo(pointer.downX, pointer.downY);
      this.lineGraphics.lineTo(pointer.x, pointer.y);
      this.lineGraphics.strokePath();
    }
  }
  stopDrawing(pointer) {
    this.lineGraphics.clear();
    this.isDrawing = false;
    let bodies = this.matter.world.localWorld.bodies;
    let toBeSliced = [];
    let toBeCreated = [];
    let color;
    let dynamic;
    for (let i = 0; i < bodies.length; i++) {
      let vertices = bodies[i].parts[0].vertices;
      let pointsArray = [];
      vertices.forEach(function (vertex) {
        pointsArray.push(vertex.x, vertex.y)
      });
      let slicedPolygons = PolyK.Slice(pointsArray, pointer.downX, pointer.downY, pointer.upX, pointer.upY);
      if (slicedPolygons.length > 1) {
        toBeSliced.push(bodies[i]);
        slicedPolygons.forEach(function (points) {
          toBeCreated.push(points)
        })

      }
    }
    toBeSliced.forEach(function (body) {
      color = body.gameObject.fillColor;
      dynamic = !body.gameObject.isStatic;
      body.gameObject.destroy();
      this.matter.world.remove(body)
    }.bind(this))
    toBeCreated.forEach(function (points) {
      let polyObject = [];
      for (let i = 0; i < points.length / 2; i++) {
        polyObject.push({
          x: points[i * 2],
          y: points[i * 2 + 1]
        })
      }
      let sliceCentre = Phaser.Physics.Matter.Matter.Vertices.centre(polyObject);
      let reverse = dynamic ? -1 : 1;
      let body = this.createBody(sliceCentre.x, sliceCentre.y, polyObject, color, dynamic, reverse);
      body.body = this.matter.add.fromVertices(sliceCentre.x, sliceCentre.y, polyObject, {
        isStatic: false
      });
    }.bind(this))
  }

  update() {
    if (!startGame) {
      this.showMenu(true);
      return;
    }
    if (!levelBuilt) {
      //this.matter.world.setBounds(10, 10, game.config.width - 20, game.config.height - 20);
      this.buildLevel(currentLevel);
    }
    this.showStatus();

  }

  showStatus() {
    var textFormat = {
      fontFamily: 'Arial',
      fontStyle: 'Bold',
      fontSize: 16,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    };

    var lvlText = this.add.text(
      10, 10, 'Level:' + currentLevel, textFormat);

    var slices = this.add.text(
      this.game.config.width - 100, 10,
      'Slices Left:' + levelMarkerData[i].slicesLeft, textFormat);

    var target = this.add.text(
      10, this.game.config.height - 50,
      'Target:' + levelMarkerData[i].target + '%', textFormat);

    var removed = this.add.text(
      this.game.config.width - 100, this.game.config.height - 50,
      'Removed:' + levelMarkerData[i].percent + '%', textFormat);
  }

  levelSelected(x, y) {
    startGame = true;
    currentLevel = x + ((y - 1) * 4);
    this.showMenu(false);
  }

  getLevel(x, y) {
    return x + ((y - 1) * 4);
  }

  buildLevel(currentLevel) {
    this.cameras.main.setBackgroundColor(0xCCCCCC);
    //this.matter.world.setBounds();
    const curLvl = levelData[currentLevel - 1];
    const curPolys = curLvl.polygons;
    for (let index = 0; index < curPolys.length; index++) {
      let reverse = curPolys[index].dynamic ? -1 : 1;
      let x = curPolys[index].startX + (curPolys[index].width / 2) * reverse;

      x += (this.game.config.width / 30) * reverse * -1;
      let y = curPolys[index].startY + ((curPolys[index].height / 2) * reverse) - (curPolys[index].startY / 30);
      //     let x = curPolys[index].startX + ((curPolys[index].width / 2) * reverse) + (curPolys[index].startX / 3);
      //      let y = curPolys[index].startY + ((curPolys[index].height / 2) * reverse) - (curPolys[index].startY / 30);
      var data = curPolys[index].coordinates;

      //   console.log(x, y, data);
      for (let i = 0; i < data.length; i++) {
        data[i] *= reverse;

      }
      this.createBody(x, y, data, colorSwitch(curPolys[index].color), curPolys[index].dynamic, reverse);
    }

    this.matter.world.update30Hz();
    //this.matter.add.rectangle(polygon.points);
    this.lineGraphics = this.add.graphics();
    this.input.on("pointerdown", this.startDrawing, this);
    this.input.on("pointerup", this.stopDrawing, this);
    this.input.on("pointermove", this.keepDrawing, this);
    this.isDrawing = false;
    levelBuilt = true;
  }

  createBody(x, y, data, color, dynamic, reverse) {
    console.log(x, y, color, dynamic, reverse);
    var polygon = this.add.polygon(x, y, data, color);
    polygon.setStrokeStyle(2, 0x00);
    this.matter.add.gameObject(polygon).setStatic(!dynamic).setOrigin(0.5 * reverse, 0.5 * reverse);
    polygon.body.density = 5;
    polygon.body.friction = 0.2;
    polygon.body.restitution = 0;
  }

  showMenu(onOff) {
    menu.visible = onOff;
    if (!onOff) {
      for (let index = 0; index < text.length; index++) {
        text[index].destroy();
      }
      return;
    }
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 5; x++) {
        let i = this.getLevel(x, y) - 1;
        if (levelMarkerData[i].unlocked) {
          var lvlText = this.add.text(
            levelMarkerData[i].x - 25,
            levelMarkerData[i].y - 30,
            levelMarkerData[i].level, {
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#ffffff'
            });
          var lvlText2 = this.add.text(
            levelMarkerData[i].x - 25,
            levelMarkerData[i].y,
            levelMarkerData[i].percent + '%', {
              fontFamily: 'Arial',
              fontSize: 16,
              color: '#ffffff'
            });
          text.push(lvlText);
          text.push(lvlText2);
        }
      }
    }
  }

  buildMenu() {
    titleShadow = this.add.image(325, 55, 'titleShadow').setScale(.3).setOrigin(0.5, 0.5);
    title = this.add.image(320, 50, 'title').setScale(.3).setOrigin(0.5, 0.5);
    let i = 1;
    let lvlButtons = [];
    for (let y = 1; y <= 4; y++) {
      for (let x = 1; x <= 5; x++) {
        const lvlButton = this.add.image(x * 105, y * 100 + 30, 'level_marker')
          .setScale(.4)
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
          target: 100,
          slicesLeft: 3,
        }
        levelMarkerData.push(levelMarker);
        if (levelMarker.level < 6)
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

};