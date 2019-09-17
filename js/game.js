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
          y: 1
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
    this.load.json('levelData', 'assets/map.json');
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

      for (var i = 0; i < 4; i++) {
        level.scoreTargets.push(data[index][i]);
      }

      for (var i = 4; i < data[index].length; i++) {
        var poly = {
          startX: data[index][i][0],
          startY: data[index][i][1],
          endX: data[index][i][2],
          endY: data[index][i][3],
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
      let sliceCentre = Phaser.Physics.Matter.Matter.Vertices.centre(polyObject)
      let slicedBody = this.matter.add.fromVertices(sliceCentre.x, sliceCentre.y, polyObject, {
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
    var lvlText = this.add.text(
      10, 10,
      'Level:' + currentLevel, {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
      });

    var slices = this.add.text(
      this.game.config.width - 100, 10,
      'Slices Left:' + levelMarkerData[i].slicesLeft, {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
      });

    var target = this.add.text(
      10, this.game.config.height - 50,
      'Target:' + levelMarkerData[i].target + '%', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
      });

    var removed = this.add.text(
      this.game.config.width - 100, this.game.config.height - 50,
      'Removed:' + levelMarkerData[i].percent + '%', {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#ffffff'
      });
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
    const curLvl = levelData[currentLevel - 1];
    const curPolys = curLvl.polygons;
    for (let index = 0; index < curPolys.length; index++) {
      let reverse = curPolys[index].dynamic ? -1 : 1;
      let x = curPolys[index].startX;
      let y = curPolys[index].startY;
      var data = curPolys[index].coordinates;
      var polygon = this.add.polygon(x, y, data, 0x0000ff, 0.8);
      for (var i = 0; i < polygon.geom.points.length; i++) {
        polygon.geom.points[i].x = x + (polygon.geom.points[i].x * reverse);
        polygon.geom.points[i].y = y + (polygon.geom.points[i].y * reverse);
      }

      var graphics = this.add.graphics({
        x: 0,
        y: 0
      });
      let fillColor;
      switch (curPolys[index].color) {
        case "red":
          fillColor = '0xff0000';
          break;
        case "blue":
          fillColor = '0x0000ff';
          break;
        case "white":
          fillColor = '0xffffff';
          break;
        default:
          fillColor = '0x000000'
          break;
      }

      graphics.fillStyle(fillColor);
      graphics.fillPoints(polygon.geom.points, true);

      graphics.lineStyle(2, 0x00);
      graphics.beginPath();
      graphics.moveTo(x, y);
      for (var i = 0; i < polygon.geom.points.length; i++) {
        graphics.lineTo(polygon.geom.points[i].x, polygon.geom.points[i].y);
      }

      graphics.closePath();
      graphics.strokePath();
      polys.push(curPolys);
      this.matter.add.gameObject(polygon);
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