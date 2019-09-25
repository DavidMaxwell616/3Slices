let game;
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
  create() {
    let reverse = -1;
    this.matter.world.update30Hz();
    this.cameras.main.setBackgroundColor(0xCCCCCC);
    this.matter.world.setBounds(10, 10, game.config.width - 10, game.config.height - 10);
    var path = '0.00, 2.00, 172.00, 0.00, 180.00, 304.00, 0.00, 296.00';
    var verts = this.matter.verts.fromPath(path);
    for (let i = 0; i < verts.length; i++) {
      verts[i].x *= reverse;
      verts[i].y *= reverse;
    }
    var poly = this.add.polygon(361.033, 366.5909, verts, 0xff0000);
    //console.log(poly);
    poly.setStrokeStyle(2, 0x00);
    console.log(poly);
    var body = this.matter.add.gameObject(poly, {
      shape: {
        type: 'fromVerts',
        verts,
        flagInternal: true
      }
    }).setOrigin(0.5 * reverse, 0.5 * reverse);
    //   this.matter.add.rectangle(game.config.width / 2 - 50, game.config.width / 2, 100, 300);
    this.lineGraphics = this.add.graphics();
    this.input.on("pointerdown", this.startDrawing, this);
    this.input.on("pointerup", this.stopDrawing, this);
    this.input.on("pointermove", this.keepDrawing, this);
    this.isDrawing = false;
  }
  startDrawing() {
    this.isDrawing = true;
  }
  keepDrawing(pointer) {
    if (this.isDrawing) {
      this.lineGraphics.clear();
      this.lineGraphics.lineStyle(2, 0x00);
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
      if (!bodies[i].isStatic) {
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
    }
    let polyFill;
    toBeSliced.forEach(function (body) {
      polyFill = body.gameObject.fillColor;
      body.gameObject.destroy();
      this.matter.world.remove(body);
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
      var verts = this.matter.verts.fromPath(points.join(' '));
      for (let i = 0; i < verts.length; i++) {
        (verts[i].x -= sliceCentre.x) * -1;
        (verts[i].y -= sliceCentre.y) * -1;
      }
      var poly = this.add.polygon(sliceCentre.x, sliceCentre.y, verts, polyFill);
      poly.setStrokeStyle(2, 0x00);
      this.matter.add.gameObject(
        poly, {
          shape: {
            type: 'fromVerts',
            verts,
            flagInternal: true
          }
        }).setOrigin(0, 0);
      // console.log(body);
    }.bind(this))
  }
};