package
{
   import Box2D.Collision.Shapes.b2PolygonShape;
   import Box2D.Collision.b2Segment;
   import Box2D.Common.Math.b2Vec2;
   import Box2D.Dynamics.*;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   
   public class PlayLevel extends Sprite
   {
       
      
      private var world:b2World;
      
      private var worldScale:int = 30;
      
      private var debris:Sprite;
      
      private var canvas:Sprite;
      
      private var laserSegment:b2Segment;
      
      private var drawing:Boolean = false;
      
      private var affectedByLaser:Vector.<b2Body>;
      
      private var entryPoint:Vector.<b2Vec2>;
      
      private var allStable:Boolean = false;
      
      private var allStableCD:Number = 0;
      
      private var levelEnded:Boolean = false;
      
      private var levelFailed:Boolean = false;
      
      private var levelPassed:Boolean = false;
      
      var fixtureDef:b2FixtureDef;
      
      var sliceUsed:Boolean = false;
      
      var slicesLeft = 3;
      
      var totalRedMass:Number = 0;
      
      var removedRedMass:Number = 0;
      
      private var percentRemoved:Number = 0;
      
      private var percentTarget;
      
      private var prevBest:int;
      
      var main:Object;
      
      var lvl:int;
      
      private var bg:MovieClip;
      
      var hud:MovieClip;
      
      var optionsMenu:MovieClip;
      
      public function PlayLevel(param1:*, param2:*)
      {
         this.world = new b2World(new b2Vec2(0,0),true);
         this.fixtureDef = new b2FixtureDef();
         this.bg = new lvl_backgrounds();
         super();
         this.main = param1;
         this.lvl = param2;
         if(this.main.sliceMode == 1)
         {
            this.prevBest = this.main.scoreArray1[this.lvl - 1];
         }
         else if(this.main.sliceMode == 2)
         {
            this.prevBest = this.main.scoreArray2[this.lvl - 1];
         }
         else
         {
            this.prevBest = this.main.scoreArray[this.lvl - 1];
         }
         this.fixtureDef.density = 5;
         this.fixtureDef.friction = 0.2;
         this.fixtureDef.restitution = 0;
         if(this.lvl == 1 && this.main.sliceMode == 3)
         {
            this.bg.gotoAndStop(2);
         }
         else if(this.lvl == 3 && this.main.sliceMode == 3)
         {
            this.bg.gotoAndStop(3);
         }
         else if(this.lvl == 5 && this.main.sliceMode == 3)
         {
            this.bg.gotoAndStop(4);
         }
         addChild(this.bg);
         this.debris = new Sprite();
         addChild(this.debris);
         this.canvas = new Sprite();
         addChild(this.canvas);
         this.buildLevel();
         this.addEventListener(Event.ENTER_FRAME,this.updateWorld,false,0,true);
         this.main.stage.addEventListener(KeyboardEvent.KEY_DOWN,this.onKeyboardEvent,false,0,true);
         this.main.stage.addEventListener(KeyboardEvent.KEY_UP,this.onKeyboardEvent,false,0,true);
         this.main.stage.addEventListener(MouseEvent.MOUSE_DOWN,this.mousePressed,false,0,true);
         this.main.stage.addEventListener(MouseEvent.MOUSE_MOVE,this.mouseMoved,false,0,true);
         this.main.stage.addEventListener(MouseEvent.MOUSE_UP,this.mouseReleased,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.plRemoved,false,0,true);
         this.hud = new HUD();
         this.hud.y = 486;
         this.hud.lvlno.text = this.lvl + "";
         if(this.main.sliceMode == 1)
         {
            this.hud.target.text = "";
            this.slicesLeft = 1;
            this.hud.slices.text = "/";
            this.hud.gold.text = "Gold: " + this.main.maps[this.lvl - 1][3] + "%";
            if(this.prevBest > 0)
            {
               this.hud.best.text = "Best: " + this.prevBest + "%";
            }
            else
            {
               this.hud.best.text = "";
            }
         }
         else if(this.main.sliceMode == 2)
         {
            this.hud.target.text = "";
            this.slicesLeft = 2;
            this.hud.slices.text = "/ /";
            this.hud.gold.text = "Gold: " + this.main.maps[this.lvl - 1][2] + "%";
            if(this.prevBest > 0)
            {
               this.hud.best.text = "Best: " + this.prevBest + "%";
            }
            else
            {
               this.hud.best.text = "";
            }
         }
         else
         {
            this.hud.target.text = "Target: " + this.percentTarget + "%";
            if(this.prevBest > 0)
            {
               this.hud.best.text = "Best: " + this.prevBest + "%";
               this.hud.gold.text = "Gold: " + this.main.maps[this.lvl - 1][1] + "%";
            }
            else
            {
               this.hud.best.text = "";
               this.hud.gold.text = "";
            }
         }
         this.hud.options_btn.addEventListener(MouseEvent.MOUSE_DOWN,this.OptionsPressed,false,0,true);
         addChild(this.hud);
      }
      
      function plRemoved(param1:Event) : *
      {
         this.removeEventListener(Event.ENTER_FRAME,this.updateWorld);
         this.main.stage.removeEventListener(KeyboardEvent.KEY_DOWN,this.onKeyboardEvent);
         this.main.stage.removeEventListener(KeyboardEvent.KEY_UP,this.onKeyboardEvent);
         this.main.stage.removeEventListener(MouseEvent.MOUSE_DOWN,this.mousePressed);
         this.main.stage.removeEventListener(MouseEvent.MOUSE_MOVE,this.mouseMoved);
         this.main.stage.removeEventListener(MouseEvent.MOUSE_UP,this.mouseReleased);
         this.removeEventListener(Event.REMOVED_FROM_STAGE,this.plRemoved);
         this.hud.options_btn.removeEventListener(MouseEvent.MOUSE_DOWN,this.OptionsPressed);
      }
      
      public function onKeyboardEvent(param1:KeyboardEvent) : void
      {
         if(param1.type == "keyUp")
         {
            if(param1.keyCode == 82 || param1.keyCode == 114)
            {
               this.Retry();
            }
            if(param1.keyCode == 78 || param1.keyCode == 110)
            {
               if(this.levelPassed)
               {
                  this.NextPressed();
               }
            }
            if(param1.keyCode == 76 || param1.keyCode == 108)
            {
               this.LevelSelectorPressed();
            }
            if(param1.keyCode == 87 || param1.keyCode == 119)
            {
               this.main.HUDWalkthroughPressed();
            }
         }
      }
      
      private function LevelSuccess() : *
      {
         trace("success!");
         this.hud.slices.text = "Success!";
         this.optionsMenu = new pl_success();
         this.optionsMenu.x = 490;
         this.optionsMenu.y = 368;
         this.optionsMenu.next.addEventListener(MouseEvent.MOUSE_DOWN,this.NextPressed,false,0,true);
         this.optionsMenu.retry.addEventListener(MouseEvent.MOUSE_DOWN,this.Retry,false,0,true);
         this.optionsMenu.level_select.addEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed,false,0,true);
         this.optionsMenu.addEventListener(Event.REMOVED_FROM_STAGE,this.SuccessRemoved,false,0,true);
         addChild(this.optionsMenu);
         this.main.UpdateLevelBeaten(this.lvl,this.percentRemoved);
         if(this.main.sfxOn && !this.levelPassed)
         {
            this.main.s_pass.play(0,1);
         }
         this.levelPassed = true;
      }
      
      function SuccessRemoved(param1:Event) : *
      {
         trace("success removed");
         this.optionsMenu.next.removeEventListener(MouseEvent.MOUSE_DOWN,this.NextPressed);
         this.optionsMenu.retry.removeEventListener(MouseEvent.MOUSE_DOWN,this.Retry);
         this.optionsMenu.level_select.removeEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed);
         this.optionsMenu.removeEventListener(Event.REMOVED_FROM_STAGE,this.SuccessRemoved);
      }
      
      private function LevelFail() : *
      {
         this.optionsMenu = new pl_fail();
         this.optionsMenu.x = 490;
         this.optionsMenu.y = 368;
         this.optionsMenu.retry.addEventListener(MouseEvent.MOUSE_DOWN,this.Retry,false,0,true);
         this.optionsMenu.level_select.addEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed,false,0,true);
         this.optionsMenu.walkthrough.addEventListener(MouseEvent.MOUSE_DOWN,this.main.HUDWalkthroughPressed,false,0,true);
         this.optionsMenu.addEventListener(Event.REMOVED_FROM_STAGE,this.FailRemoved,false,0,true);
         addChild(this.optionsMenu);
         if(this.main.sfxOn)
         {
            this.main.s_fail.play(0,1);
         }
      }
      
      function FailRemoved(param1:Event) : *
      {
         trace("fail removed");
         this.optionsMenu.retry.removeEventListener(MouseEvent.MOUSE_DOWN,this.Retry);
         this.optionsMenu.level_select.removeEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed);
         this.optionsMenu.walkthrough.removeEventListener(MouseEvent.MOUSE_DOWN,this.main.HUDWalkthroughPressed);
         this.optionsMenu.removeEventListener(Event.REMOVED_FROM_STAGE,this.FailRemoved);
      }
      
      private function OptionsPressed(param1:MouseEvent) : *
      {
         this.optionsMenu = new pl_options();
         this.optionsMenu.x = 490;
         this.optionsMenu.y = 368;
         this.optionsMenu.hide_options.addEventListener(MouseEvent.MOUSE_DOWN,this.HideOptions,false,0,true);
         this.optionsMenu.retry.addEventListener(MouseEvent.MOUSE_DOWN,this.Retry,false,0,true);
         this.optionsMenu.level_select.addEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed,false,0,true);
         this.optionsMenu.walkthrough.addEventListener(MouseEvent.MOUSE_DOWN,this.main.HUDWalkthroughPressed,false,0,true);
         this.optionsMenu.addEventListener(Event.REMOVED_FROM_STAGE,this.OptionsRemoved,false,0,true);
         addChild(this.optionsMenu);
      }
      
      private function HideOptions(param1:MouseEvent) : *
      {
         removeChild(this.optionsMenu);
      }
      
      function OptionsRemoved(param1:Event) : *
      {
         trace("options removed");
         this.optionsMenu.hide_options.removeEventListener(MouseEvent.MOUSE_DOWN,this.HideOptions);
         this.optionsMenu.retry.removeEventListener(MouseEvent.MOUSE_DOWN,this.Retry);
         this.optionsMenu.level_select.removeEventListener(MouseEvent.MOUSE_DOWN,this.LevelSelectorPressed);
         this.optionsMenu.walkthrough.removeEventListener(MouseEvent.MOUSE_DOWN,this.main.HUDWalkthroughPressed);
         this.optionsMenu.removeEventListener(Event.REMOVED_FROM_STAGE,this.OptionsRemoved);
      }
      
      private function LevelSelectorPressed(param1:MouseEvent = null) : *
      {
         if(this.main.sfxOn)
         {
            this.main.s_btn.play(0,1);
         }
         this.main.UpdateLevelBeaten(this.lvl,this.percentRemoved);
         if(param1 != null)
         {
            removeChild(this.optionsMenu);
         }
         this.main.MakeLevelSelector();
      }
      
      private function NextPressed(param1:MouseEvent = null) : *
      {
         this.main.UpdateLevelBeaten(this.lvl,this.percentRemoved);
         this.main.NextLevel();
      }
      
      private function Retry(param1:MouseEvent = null) : *
      {
         if(this.main.sfxOn)
         {
            this.main.s_btn.play(0,1);
         }
         this.main.UpdateLevelBeaten(this.lvl,this.percentRemoved);
         this.main.RetryLevel();
         trace("r");
      }
      
      private function mousePressed(param1:MouseEvent) : void
      {
         if(this.slicesLeft > 0)
         {
            this.drawing = true;
            this.laserSegment = new b2Segment();
            this.laserSegment.p1 = new b2Vec2(mouseX / this.worldScale,mouseY / this.worldScale);
         }
      }
      
      private function mouseMoved(param1:MouseEvent) : void
      {
         if(this.drawing)
         {
            this.canvas.graphics.clear();
            this.canvas.graphics.lineStyle(2,0);
            this.canvas.graphics.moveTo(this.laserSegment.p1.x * this.worldScale,this.laserSegment.p1.y * this.worldScale);
            this.canvas.graphics.lineTo(mouseX,mouseY);
         }
      }
      
      private function mouseReleased(param1:MouseEvent) : void
      {
         this.drawing = false;
         this.canvas.graphics.clear();
         if(this.slicesLeft > 0)
         {
            this.laserSegment.p2 = new b2Vec2(mouseX / this.worldScale,mouseY / this.worldScale);
         }
      }
      
      private function buildLevel() : void
      {
         var _loc2_:Array = null;
         var _loc6_:int = 0;
         var _loc1_:Array = this.main.maps[this.lvl - 1];
         var _loc3_:Array = new Array();
         var _loc4_:Array = new Array();
         if(this.main.sliceMode == 3)
         {
            this.percentTarget = _loc1_[0];
         }
         else
         {
            this.percentTarget = 1;
         }
         var _loc5_:int = 4;
         while(_loc5_ < _loc1_.length)
         {
            _loc6_ = 0;
            while(_loc6_ < 20)
            {
               _loc1_[_loc5_][11] = _loc1_[_loc5_][11].replace(")","");
               _loc1_[_loc5_][11] = _loc1_[_loc5_][11].replace("(","");
               _loc6_++;
            }
            _loc2_ = _loc1_[_loc5_][11].split("-");
            _loc6_ = 0;
            while(_loc6_ < _loc2_.length)
            {
               _loc4_ = _loc2_[_loc6_].split("|");
               _loc3_[_loc6_] = new b2Vec2(Number(_loc4_[0]) / this.worldScale,Number(_loc4_[1]) / this.worldScale);
               _loc6_++;
            }
            this.createBody(_loc1_[_loc5_][0] / this.worldScale,_loc1_[_loc5_][1] / this.worldScale,_loc3_,_loc1_[_loc5_][10],_loc1_[_loc5_][4],_loc1_[_loc5_][5]);
            _loc5_++;
         }
      }
      
      private function createBody(param1:Number, param2:Number, param3:Array, param4:String, param5:Number, param6:Boolean) : *
      {
         var _loc7_:Vector.<b2Vec2> = Vector.<b2Vec2>(param3);
         var _loc8_:b2BodyDef = new b2BodyDef();
         if(param6)
         {
            _loc8_.type = b2Body.b2_dynamicBody;
         }
         else
         {
            _loc8_.type = b2Body.b2_staticBody;
         }
         var _loc9_:b2PolygonShape = new b2PolygonShape();
         _loc9_.SetAsVector(_loc7_);
         _loc8_.position.Set(param1,param2);
         if(!param6)
         {
            param4 = "black";
         }
         _loc8_.userData = new userData(_loc7_,param4);
         this.debris.addChild(_loc8_.userData);
         _loc8_.angle = param5;
         this.fixtureDef.shape = _loc9_;
         var _loc10_:b2Body = this.world.CreateBody(_loc8_);
         _loc10_.CreateFixture(this.fixtureDef);
         if(param4 == "red" || param4 == "blue")
         {
            this.totalRedMass = this.totalRedMass + _loc10_.GetMass();
         }
      }
      
      private function updateWorld(param1:Event) : void
      {
         var _loc2_:b2Vec2 = null;
         var _loc3_:Number = NaN;
         var _loc5_:b2Vec2 = null;
         this.world.Step(1 / 30,10,10);
         this.world.ClearForces();
         this.allStable = true;
         if(this.laserSegment && !this.drawing)
         {
            this.affectedByLaser = new Vector.<b2Body>();
            this.entryPoint = new Vector.<b2Vec2>();
            this.world.RayCast(this.laserFired,this.laserSegment.p1,this.laserSegment.p2);
            this.world.RayCast(this.laserFired,this.laserSegment.p2,this.laserSegment.p1);
            this.laserSegment = null;
         }
         var _loc4_:int = 0;
         var _loc6_:b2Body = this.world.GetBodyList();
         while(_loc6_)
         {
            _loc4_++;
            if(_loc6_.GetUserData() != null)
            {
               _loc5_ = _loc6_.GetWorldCenter();
               if(_loc6_.GetUserData().col == "red" || _loc6_.GetUserData().col == "white")
               {
                  _loc6_.ApplyForce(new b2Vec2(0,_loc6_.GetMass() * 10),_loc5_);
               }
               else if(_loc6_.GetUserData().col == "blue")
               {
                  _loc6_.ApplyForce(new b2Vec2(0,_loc6_.GetMass() * -10),_loc5_);
               }
               _loc6_.GetUserData().x = _loc6_.GetPosition().x * this.worldScale;
               _loc6_.GetUserData().y = _loc6_.GetPosition().y * this.worldScale;
               _loc6_.GetUserData().rotation = _loc6_.GetAngle() * 180 / Math.PI;
               _loc2_ = _loc6_.GetLinearVelocity();
               _loc3_ = Math.abs(_loc2_.x) + Math.abs(_loc2_.y);
               if(_loc3_ > 0.1)
               {
                  this.allStable = false;
               }
               if(_loc6_.GetUserData().y > 800 || _loc6_.GetUserData().y < -300)
               {
                  if(_loc6_.GetUserData() != null)
                  {
                     if(_loc6_.GetUserData().col == "red" || _loc6_.GetUserData().col == "blue")
                     {
                        this.removedRedMass = this.removedRedMass + _loc6_.GetMass();
                        this.percentRemoved = Math.floor(100 * this.removedRedMass / this.totalRedMass + 0.01);
                        if(this.percentRemoved > 100)
                        {
                           this.percentRemoved = 100;
                        }
                        trace("removed = " + this.percentRemoved + "%   - target = " + this.percentTarget + "%");
                        this.hud.removed.text = "Removed: " + this.percentRemoved + "%";
                        if(this.prevBest != 0 && this.percentRemoved > this.prevBest)
                        {
                           this.hud.message.text = "A NEW RECORD!";
                        }
                        if(this.percentRemoved == 100 && !this.levelEnded)
                        {
                           this.LevelSuccess();
                        }
                        if(this.levelFailed && this.percentRemoved >= this.percentTarget)
                        {
                           this.levelFailed = false;
                           removeChild(this.optionsMenu);
                           this.LevelSuccess();
                        }
                     }
                     this.debris.removeChild(_loc6_.GetUserData());
                  }
                  this.world.DestroyBody(_loc6_);
               }
            }
            _loc6_ = _loc6_.GetNext();
         }
         if(this.sliceUsed)
         {
            this.slicesLeft--;
            this.sliceUsed = false;
            trace("slices left = " + this.slicesLeft);
            if(this.slicesLeft == 2)
            {
               this.hud.slices.text = "/ /";
               if(this.main.sfxOn)
               {
                  this.main.s_cut.play(0,1);
               }
            }
            else if(this.slicesLeft == 1)
            {
               this.hud.slices.text = "/";
               if(this.main.sfxOn)
               {
                  this.main.s_cut2.play(0,1);
               }
            }
            else if(this.slicesLeft == 0)
            {
               this.hud.slices.text = "Please Wait";
               if(this.main.sfxOn)
               {
                  this.main.s_cut3.play(0,1);
               }
            }
         }
         if(this.slicesLeft == 0 && !this.levelEnded)
         {
            if(this.allStable)
            {
               this.allStableCD++;
            }
            else
            {
               this.allStableCD = this.allStableCD + 0.01;
            }
            if(this.allStableCD > 10)
            {
               this.levelEnded = true;
               if(this.percentRemoved >= this.percentTarget)
               {
                  this.LevelSuccess();
               }
               else
               {
                  this.LevelFail();
                  this.levelFailed = true;
                  this.hud.slices.text = "Fail :(";
               }
               if(this.prevBest != 0 && this.percentRemoved < this.prevBest)
               {
                  this.hud.message.text = "You didn\'t beat your previous best";
               }
            }
         }
      }
      
      private function laserFired(param1:b2Fixture, param2:b2Vec2, param3:b2Vec2, param4:Number) : Number
      {
         var _loc8_:b2Vec2 = null;
         var _loc9_:Number = NaN;
         var _loc10_:Vector.<b2Vec2> = null;
         var _loc11_:Vector.<b2Vec2> = null;
         var _loc12_:Vector.<b2Vec2> = null;
         var _loc13_:int = 0;
         var _loc14_:Boolean = false;
         var _loc15_:Boolean = false;
         var _loc16_:int = 0;
         var _loc17_:b2Vec2 = null;
         var _loc18_:Number = NaN;
         var _loc5_:b2Body = param1.GetBody();
         var _loc6_:b2PolygonShape = param1.GetShape() as b2PolygonShape;
         var _loc7_:int = this.affectedByLaser.indexOf(_loc5_);
         if(_loc7_ == -1)
         {
            this.affectedByLaser.push(_loc5_);
            this.entryPoint.push(param2);
         }
         else if(_loc5_.GetUserData().col == "black")
         {
            this.affectedByLaser.push(_loc5_);
            this.entryPoint.push(param2);
         }
         else
         {
            _loc8_ = new b2Vec2((param2.x + this.entryPoint[_loc7_].x) / 2,(param2.y + this.entryPoint[_loc7_].y) / 2);
            _loc9_ = Math.atan2(this.entryPoint[_loc7_].y - param2.y,this.entryPoint[_loc7_].x - param2.x);
            _loc10_ = _loc6_.GetVertices();
            _loc11_ = new Vector.<b2Vec2>();
            _loc12_ = new Vector.<b2Vec2>();
            _loc13_ = 0;
            _loc14_ = false;
            _loc15_ = false;
            _loc16_ = 0;
            while(_loc16_ < _loc10_.length)
            {
               _loc17_ = _loc5_.GetWorldPoint(_loc10_[_loc16_]);
               _loc18_ = Math.atan2(_loc17_.y - _loc8_.y,_loc17_.x - _loc8_.x) - _loc9_;
               if(_loc18_ < Math.PI * -1)
               {
                  _loc18_ = _loc18_ + 2 * Math.PI;
               }
               if(_loc18_ > 0 && _loc18_ <= Math.PI)
               {
                  if(_loc13_ == 2)
                  {
                     _loc14_ = true;
                     _loc11_.push(param2);
                     _loc11_.push(this.entryPoint[_loc7_]);
                  }
                  _loc11_.push(_loc17_);
                  _loc13_ = 1;
               }
               else
               {
                  if(_loc13_ == 1)
                  {
                     _loc15_ = true;
                     _loc12_.push(this.entryPoint[_loc7_]);
                     _loc12_.push(param2);
                  }
                  _loc12_.push(_loc17_);
                  _loc13_ = 2;
               }
               _loc16_++;
            }
            if(!_loc14_)
            {
               _loc11_.push(param2);
               _loc11_.push(this.entryPoint[_loc7_]);
            }
            if(!_loc15_)
            {
               _loc12_.push(this.entryPoint[_loc7_]);
               _loc12_.push(param2);
            }
            this.createSlice(_loc11_,_loc11_.length,_loc5_.GetUserData().col);
            this.createSlice(_loc12_,_loc12_.length,_loc5_.GetUserData().col);
            if(_loc5_.GetUserData() != null)
            {
               this.debris.removeChild(_loc5_.GetUserData());
            }
            this.world.DestroyBody(_loc5_);
            this.sliceUsed = true;
         }
         return 1;
      }
      
      private function findCentroid(param1:Vector.<b2Vec2>, param2:uint) : b2Vec2
      {
         var _loc9_:b2Vec2 = null;
         var _loc10_:b2Vec2 = null;
         var _loc11_:Number = NaN;
         var _loc12_:Number = NaN;
         var _loc13_:Number = NaN;
         var _loc14_:Number = NaN;
         var _loc15_:Number = NaN;
         var _loc16_:Number = NaN;
         var _loc3_:b2Vec2 = new b2Vec2();
         var _loc4_:Number = 0;
         var _loc5_:Number = 0;
         var _loc6_:Number = 0;
         var _loc7_:Number = 1 / 3;
         var _loc8_:int = 0;
         while(_loc8_ < param2)
         {
            _loc9_ = param1[_loc8_];
            _loc10_ = _loc8_ + 1 < param2?param1[int(_loc8_ + 1)]:param1[0];
            _loc11_ = _loc9_.x - _loc5_;
            _loc12_ = _loc9_.y - _loc6_;
            _loc13_ = _loc10_.x - _loc5_;
            _loc14_ = _loc10_.y - _loc6_;
            _loc15_ = _loc11_ * _loc14_ - _loc12_ * _loc13_;
            _loc16_ = 0.5 * _loc15_;
            _loc4_ = _loc4_ + _loc16_;
            _loc3_.x = _loc3_.x + _loc16_ * _loc7_ * (_loc5_ + _loc9_.x + _loc10_.x);
            _loc3_.y = _loc3_.y + _loc16_ * _loc7_ * (_loc6_ + _loc9_.y + _loc10_.y);
            _loc8_++;
         }
         _loc3_.x = _loc3_.x * (1 / _loc4_);
         _loc3_.y = _loc3_.y * (1 / _loc4_);
         return _loc3_;
      }
      
      private function createSlice(param1:Vector.<b2Vec2>, param2:int, param3:String) : void
      {
         var _loc4_:b2Vec2 = this.findCentroid(param1,param1.length);
         var _loc5_:b2BodyDef = new b2BodyDef();
         _loc5_.position.Set(_loc4_.x,_loc4_.y);
         _loc5_.type = b2Body.b2_dynamicBody;
         var _loc6_:int = 0;
         while(_loc6_ < param2)
         {
            param1[_loc6_].Subtract(_loc4_);
            _loc6_++;
         }
         _loc5_.userData = new userData(param1,param3);
         this.debris.addChild(_loc5_.userData);
         var _loc7_:b2PolygonShape = new b2PolygonShape();
         _loc7_.SetAsVector(param1,param2);
         var _loc8_:b2FixtureDef = new b2FixtureDef();
         this.fixtureDef.shape = _loc7_;
         var _loc9_:b2Body = this.world.CreateBody(_loc5_);
         _loc9_.CreateFixture(this.fixtureDef);
         _loc6_ = 0;
         while(_loc6_ < param2)
         {
            param1[_loc6_].Add(_loc4_);
            _loc6_++;
         }
      }
   }
}
