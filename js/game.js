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
let selectedLevel = 0;

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
    for (let index = 0; index < 1; index++) {
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
      //  console.log(level);
      levelData.push(level);
    }
    //console.log(levelData);
    this.buildMenu();
    maxxdaddy = this.add.image(this.game.config.width * 0.9, this.game.config.height * 0.95, 'maxxdaddy');
    this.matter.world.update30Hz();
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
    buildLevel();

    this.matter.world.setBounds(10, 10, game.config.width - 20, game.config.height - 20);
    this.matter.add.rectangle(game.config.width / 2 - 50, game.config.width / 2, 100, 300);
    this.lineGraphics = this.add.graphics();
    this.input.on("pointerdown", this.startDrawing, this);
    this.input.on("pointerup", this.stopDrawing, this);
    this.input.on("pointermove", this.keepDrawing, this);
    this.isDrawing = false;


    //console.log(title);
    //this.titleShadow.visible = false;
    //this.title.visible = false;
  }

  levelSelected(x, y) {
    startGame = true;
    this.showMenu(false);
  }

  showMenu(onOff) {
    menu.visible = onOff;
    if (!onOff) {
      for (let index = 0; index < text.length; index++) {
        text[index].destroy();
      }
      return;
    }
    for (let y = 1; y < 4; y++) {
      for (let x = 1; x < 5; x++) {
        let i = 1;
        if (levelMarkerData[i].unlocked) {
          var lvlText = this.add.text(levelMarkerData[i].x - 10, levelMarkerData[i].y - 35, levelMarkerData[i].level, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff'
          });
          text.push(lvlText);
        }
      }
    }
  }

  buildMenu() {
    titleShadow = this.add.image(325, 85, 'titleShadow').setScale(.5).setOrigin(0.5, 0.5);
    title = this.add.image(320, 80, 'title').setScale(.5).setOrigin(0.5, 0.5);
    let i = 1;
    let lvlButtons = [];
    for (let y = 1; y < 4; y++) {
      for (let x = 1; x < 5; x++) {
        const lvlButton = this.add.image(x * 125, y * 100 + 110, 'level_marker')
          .setScale(.5)
          .setOrigin(0.5, 0.5)
          .setInteractive()
          .on('pointerdown', () => this.levelSelected(x, y));
        lvlButtons.push(lvlButton);
        var levelMarker = {
          level: i,
          x: x * 125,
          y: y * 100 + 110,
          unlocked: false,
          percent: 0,
        }
        if (x == 1 && y == 1)
          levelMarker.unlocked = true;
        levelMarkerData.push(levelMarker);
        i++;
      }
    }
    // console.log(this);
    menu = this.add.container(0, 0); //, [titleShadow, title, lvlButtons, levelMarkerData]);
    menu.add(titleShadow);
    menu.add(title);
    menu.add(lvlButtons);
    menu.visible = false;
  }

};