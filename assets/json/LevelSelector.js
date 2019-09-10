package
{
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.text.TextFormat;
   
   public dynamic class LevelSelector extends level_selector
   {
       
      
      var main:Object;
      
      var lvls_per_group:int = 5;
      
      var lvl_groups:int = 5;
      
      var rowTotal:int = 0;
      
      var rowTarget:Array;
      
      var scoreTarget:int = 0;
      
      var group:int;
      
      var formatA:TextFormat;
      
      var formatB:TextFormat;
      
      public function LevelSelector(param1:Object)
      {
         this.rowTarget = new Array();
         this.formatA = new TextFormat();
         this.formatB = new TextFormat();
         super();
         this.main = param1;
         this.init();
      }
      
      function init() : *
      {
         var _loc1_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:Object = null;
         var _loc6_:Object = null;
         this.formatA.color = 15044364;
         this.formatB.color = 16769071;
         this.main.UpdateScore();
         _loc1_ = 2;
         while(_loc1_ <= this.main.lvl_groups)
         {
            if(this.main.score < this.main.groupUnlock[_loc1_ - 1])
            {
               this["g" + _loc1_].l.text = this.main.groupUnlock[_loc1_ - 1] + " stars";
            }
            _loc1_++;
         }
         trace("modeun=" + this.main.modeUnlocked);
         if(this.main.modeUnlocked < 3)
         {
            if(this.main.modeUnlocked == 2)
            {
               trace("yo1");
               mode_btn.gotoAndStop(2);
               trace("yo2");
               if(this.main.sliceMode == 2)
               {
                  mode_btn.mode_switch.gotoAndStop("s2");
                  dotted_box.gotoAndStop(2);
               }
               else
               {
                  mode_btn.mode_switch.gotoAndStop("s3");
                  dotted_box.gotoAndStop(3);
               }
               trace("yo3");
            }
            else if(this.main.modeUnlocked == 1)
            {
               mode_btn.gotoAndStop(3);
               mode_btn.bg.gotoAndStop("open_both");
               if(this.main.sliceMode == 1)
               {
                  mode_btn.mode_switch.gotoAndStop("ss1");
               }
               else if(this.main.sliceMode == 2)
               {
                  mode_btn.mode_switch.gotoAndStop("ss2");
               }
               else
               {
                  mode_btn.mode_switch.gotoAndStop("ss3");
               }
            }
            trace("yo4");
            mode_btn.mouseChildren = false;
            mode_btn.addEventListener(MouseEvent.CLICK,this.modePressed,false,0,true);
            mode_btn.addEventListener(MouseEvent.MOUSE_OVER,this.srOver,false,0,true);
            mode_btn.addEventListener(MouseEvent.MOUSE_OUT,this.srOut,false,0,true);
         }
         else
         {
            dotted_box.gotoAndStop(3);
         }
         trace("yo");
         var _loc7_:Boolean = false;
         _loc1_ = 1;
         while(_loc1_ <= this.main.totLevels)
         {
            if(_loc1_ <= this.main.lvls_per_group)
            {
               this.group = 1;
               _loc5_ = g1;
               _loc3_ = 0;
            }
            else if(_loc1_ <= this.main.lvls_per_group * 2)
            {
               this.group = 2;
               _loc5_ = g2;
               _loc3_ = this.main.lvls_per_group;
               if(this.main.score < this.main.groupUnlock[1])
               {
                  _loc5_.gotoAndStop("locked");
                  _loc7_ = true;
               }
            }
            else if(_loc1_ <= this.main.lvls_per_group * 3)
            {
               this.group = 3;
               _loc5_ = g3;
               _loc3_ = this.main.lvls_per_group * 2;
               if(this.main.score < this.main.groupUnlock[2])
               {
                  _loc5_.gotoAndStop("locked");
                  _loc7_ = true;
               }
            }
            else if(_loc1_ <= this.main.lvls_per_group * 4)
            {
               this.group = 4;
               _loc5_ = g4;
               _loc3_ = this.main.lvls_per_group * 3;
               if(this.main.score < this.main.groupUnlock[3])
               {
                  _loc5_.gotoAndStop("locked");
                  _loc7_ = true;
               }
            }
            if(!_loc7_)
            {
               _loc4_ = _loc1_ - _loc3_;
               _loc6_ = _loc5_["m" + _loc4_];
               _loc6_.mouseChildren = false;
               if(_loc4_ == 1)
               {
                  this.rowTotal = 0;
                  this.rowTarget[this.group] = 0;
               }
               if(this.main.sliceMode == 1)
               {
                  this.rowTotal = this.rowTotal + this.main.scoreArray1[_loc1_ - 1];
                  this.rowTarget[this.group] = this.rowTarget[this.group] + this.main.maps[_loc1_ - 1][3];
                  this.scoreTarget = this.scoreTarget + this.main.maps[_loc1_ - 1][3];
               }
               else if(this.main.sliceMode == 2)
               {
                  this.rowTotal = this.rowTotal + this.main.scoreArray2[_loc1_ - 1];
                  this.rowTarget[this.group] = this.rowTarget[this.group] + this.main.maps[_loc1_ - 1][2];
                  this.scoreTarget = this.scoreTarget + this.main.maps[_loc1_ - 1][2];
               }
               else
               {
                  this.rowTotal = this.rowTotal + this.main.scoreArray[_loc1_ - 1];
                  this.rowTarget[this.group] = this.rowTarget[this.group] + this.main.maps[_loc1_ - 1][1];
                  this.scoreTarget = this.scoreTarget + this.main.maps[_loc1_ - 1][1];
               }
               trace(_loc1_ + " -- " + this.rowTarget[this.group]);
               if(_loc4_ == this.main.lvls_per_group && this.main.scoreArray[_loc1_ - 1] > 0)
               {
                  if(this.rowTotal >= this.rowTarget[this.group])
                  {
                     _loc5_.total.defaultTextFormat = this.formatB;
                  }
                  _loc5_.total.text = "= " + this.rowTotal + "%";
               }
               if(this.main.scoreArray[_loc1_ - 2] == 0)
               {
                  _loc6_.i = -1;
                  _loc6_.stat = "na";
                  _loc6_.n.text = "";
                  _loc6_.p.text = "";
                  _loc6_.bg.gotoAndStop("locked");
               }
               else
               {
                  _loc6_.i = _loc1_;
                  _loc6_.n.text = _loc1_.toString();
                  _loc6_.addEventListener(MouseEvent.CLICK,this.mPressed,false,0,true);
                  _loc6_.addEventListener(MouseEvent.MOUSE_OVER,this.mOver,false,0,true);
                  _loc6_.addEventListener(MouseEvent.MOUSE_OUT,this.mOut,false,0,true);
                  if(this.main.sliceMode == 1)
                  {
                     _loc6_.stars = this.main.scoreArray1[_loc1_ - 1];
                  }
                  else if(this.main.sliceMode == 2)
                  {
                     _loc6_.stars = this.main.scoreArray2[_loc1_ - 1];
                  }
                  else
                  {
                     _loc6_.stars = this.main.scoreArray[_loc1_ - 1];
                  }
                  if(_loc1_ == this.main.levelBeaten + 1)
                  {
                     _loc6_.stat = "unbeaten";
                     _loc6_.p.text = "";
                  }
                  else
                  {
                     _loc6_.stat = "open";
                     if(_loc6_.stars >= this.main.maps[_loc1_ - 1][3] && this.main.sliceMode == 1)
                     {
                        _loc6_.p.defaultTextFormat = this.formatA;
                     }
                     else if(_loc6_.stars >= this.main.maps[_loc1_ - 1][2] && this.main.sliceMode == 2)
                     {
                        _loc6_.p.defaultTextFormat = this.formatA;
                     }
                     else if(_loc6_.stars >= this.main.maps[_loc1_ - 1][1] && this.main.sliceMode == 3)
                     {
                        _loc6_.p.defaultTextFormat = this.formatA;
                     }
                     if(this.main.sliceMode == 1 && this.main.scoreArray1[_loc1_ - 1] == 0)
                     {
                        _loc6_.p.text = "";
                     }
                     else if(this.main.sliceMode == 2 && this.main.scoreArray2[_loc1_ - 1] == 0)
                     {
                        _loc6_.p.text = "";
                     }
                     else
                     {
                        _loc6_.p.text = _loc6_.stars + "%";
                     }
                     if(_loc4_ > 1)
                     {
                        _loc5_["p" + _loc4_].gotoAndStop("show");
                     }
                  }
                  trace(_loc6_.stars);
                  _loc6_.bg.gotoAndStop(_loc6_.stat);
               }
            }
            _loc1_++;
         }
         trace("scoreTarget=" + this.scoreTarget);
         if(this.main.score >= this.scoreTarget)
         {
            scoretext.defaultTextFormat = this.formatB;
         }
         scoretext.text = "Total = " + this.main.score + "%";
         if(this.main.sliceMode == 1 && this.main.score >= 300)
         {
            targettext.text = "Target = 1550%";
         }
         btn_exit.addEventListener(MouseEvent.CLICK,this.exit,false,0,true);
         btn_walkthrough.addEventListener(MouseEvent.CLICK,this.main.LSWalkthroughPressed,false,0,true);
         btn_morelevels.addEventListener(MouseEvent.CLICK,this.main.LSTGHPressed,false,0,true);
         btn_like.addEventListener(MouseEvent.CLICK,this.main.LSLikePressed,false,0,true);
         gazbtn.addEventListener(MouseEvent.CLICK,this.main.LSGazPressed,false,0,true);
         tghbtn.addEventListener(MouseEvent.CLICK,this.main.LSTGHPressed,false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,this.lsRemoved,false,0,true);
      }
      
      function lsRemoved(param1:*) : *
      {
         btn_exit.removeEventListener(MouseEvent.CLICK,this.exit);
         this.removeEventListener(Event.REMOVED_FROM_STAGE,this.lsRemoved);
      }
      
      function srOver(param1:MouseEvent) : *
      {
         if(this.main.modeUnlocked == 1)
         {
            param1.target.bg.gotoAndStop("over_both");
         }
         else
         {
            param1.target.bg.gotoAndStop("over");
         }
      }
      
      function srOut(param1:MouseEvent) : *
      {
         if(this.main.modeUnlocked == 1)
         {
            param1.target.bg.gotoAndStop("open_both");
         }
         else
         {
            param1.target.bg.gotoAndStop("open");
         }
      }
      
      function mOver(param1:MouseEvent) : *
      {
         param1.target.bg.gotoAndStop("over");
      }
      
      function mOut(param1:MouseEvent) : *
      {
         param1.target.bg.gotoAndStop(param1.target.stat);
      }
      
      function modePressed(param1:MouseEvent) : *
      {
         if(this.main.sfxOn)
         {
            this.main.s_cut.play(0,1);
         }
         if(this.main.sliceMode == 1)
         {
            this.main.sliceMode = 3;
         }
         else if(this.main.sliceMode == 3)
         {
            this.main.sliceMode = 2;
            if(this.main.modeUnlocked == 2)
            {
               dotted_box.gotoAndStop(3);
            }
         }
         else if(this.main.sliceMode == 2)
         {
            if(this.main.modeUnlocked == 1)
            {
               this.main.sliceMode = 1;
            }
            else
            {
               this.main.sliceMode = 3;
               dotted_box.gotoAndStop(2);
            }
         }
         this.main.RefreshLevelSelector();
      }
      
      function exit(param1:MouseEvent) : *
      {
         this.main.ReMakeMainMenu("ls");
      }
      
      function mPressed(param1:MouseEvent) : *
      {
         if(this.main.sfxOn)
         {
            this.main.s_cut2.play(0,1);
         }
         this.main.speedrun = false;
         this.main.lvl = param1.target.i;
         this.main.MakePlayLevel(true);
      }
   }
}
