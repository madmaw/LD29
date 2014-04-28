module GB.State.Play {

    export class PlayState extends AbstractLoopingState<PlayData> {

        public static MONSTER_TYPE_PLAYER = 0;
        public static MONSTER_TYPE_DUMMY = 1;
        public static MONSTER_TYPE_BULLET = 2;
        public static MONSTER_TYPE_EXPLOSION = 3;
        public static MONSTER_TYPE_CREEPER = 4;
        public static MONSTER_TYPE_SPINNER = 5;
        public static MONSTER_TYPE_AMBULANCE = 6;

        public static MONSTER_TYPE_PLAYER_SUBTYPE_P1 = 0;
        public static MONSTER_TYPE_DUMMY_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_BULLET_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_EXPLOSION_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_CREEPER_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_SPINNER_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_AMBULANCE_SUBTYPE_NORMAL = 0;

        public static RESULT_UNDECIDED = 0;
        public static RESULT_LOST = 1;
        public static RESULT_WON = 2;

        public static MONSTER_STATE_SPAWNED = 0;
        public static MONSTER_STATE_NORMAL = 1;
        public static MONSTER_STATE_DYING = 2;

        public static INPUT_FIRE = "fire";

        private _arenaCanvas:HTMLCanvasElement;
        private _arenaContext: CanvasRenderingContext2D;
        private _arenaDiameter: number;
        private _arenaGradient: CanvasGradient;

        private _playerMind: GB.State.Play.Mind.PlayerMind;
        private _level: Level;
        private _deathTime: number;

        private _stopScrollingCallback: (e:JQueryEventObject) => void;
        private _hammerDragHandler: (e: HammerEvent) => void;
        private _hammerDragStartHandler: (e: HammerEvent) => void;
        private _hammerDragStartAngle: number;
        private _hammerDragGrabAngle: number;
        private _hammerTapHandler: (e:HammerEvent) => void;

        private _hammer:Hammer;

        private _compassWatchId: number;
        private _compassWatcher: (heading:number)=> void;
        private _deviceOrientationWatcher : (e:any) => void;


        constructor(
            template: GB.Transformer.ITransformer<PlayData>,
            private _practise: boolean,
            private _useCompass: boolean,
            private _maxLines: number,
            levelFactory:(player:Monster)=>Level,
            private _player: Monster,
            private _oldState: IState,
            private _audioContext: AudioContext
        ) {
            super(template);

            this._stopScrollingCallback = function(e)
            {
                e.preventDefault();
            };

            this._hammerDragStartHandler = (e:HammerEvent) => {
                this._hammerDragStartAngle = this._player.getZAngle();
                var cx = window.innerWidth/2;
                var cy = this._arenaDiameter/2;
                var sx = e.gesture.center.pageX;
                var sy = e.gesture.center.pageY;
                var dx = sx - cx;
                var dy = sy - cy;
                this._hammerDragGrabAngle = Math.atan2(dy, dx);
            };

            this._hammerDragHandler = (e:HammerEvent) => {
                if( !this._useCompass ) {
                    var cx = window.innerWidth/2;
                    var cy = this._arenaDiameter/2;

                    var sx = e.gesture.startEvent.center.pageX;
                    var sy = e.gesture.startEvent.center.pageY;
                    var ex = e.gesture.deltaX + sx;
                    var ey = e.gesture.deltaY + sy;

                    var dx = ex - cx;
                    var dy = ey - cy;
                    var hammerDragAngle = Math.atan2(dy, dx);

                    var targetAngle = this._hammerDragGrabAngle - hammerDragAngle + this._hammerDragStartAngle;
                    this._playerMind.setTargetZAngle(targetAngle);
                }
            };

            this._hammerTapHandler = (e:HammerEvent) => {
                if( this._level.playerAlive ) {
                    // TODO just set as unread
                    this._playerMind.setInput(PlayState.INPUT_FIRE);
                    this._playerMind.unsetInput(PlayState.INPUT_FIRE);

                    // force an update immediately so iOS can play sounds
                    this.forceUpdate();
                } else {
                    if( (new Date()).getTime() > this._deathTime + 5000 ) {
                        this.fireNewStateEvent(this._oldState);
                    }
                }
            };

            this._compassWatcher = (heading:number) => {
                // it's that simple
                this._playerMind.setTargetZAngle((heading * Math.PI) / 180);
            };
            var first = true;
            this._deviceOrientationWatcher = (e:any) => {
                var alpha = e.alpha;
                if( alpha != null && e.absolute ) {
                    this._useCompass = true;
                    if( first ) {
                        // just add and remove this to be sure?! (nexus hack?)
                        window.removeEventListener('deviceorientation', this._deviceOrientationWatcher);
                        setTimeout(()=> {
                            window.addEventListener("deviceorientation", this._deviceOrientationWatcher);
                        }, 100);
                        first = false;
                    }
                    this._playerMind.setTargetZAngle((360 - alpha) * Math.PI / 180);
                }
            }

            this._playerMind = <GB.State.Play.Mind.PlayerMind>this._player.getMind();
            this._level = levelFactory(this._player);
        }

        public start() {

            // prevent scrolling
            $(window).on("touchmove", this._stopScrollingCallback);

            // capture events
            this._hammer = new Hammer(document, {
                drag: true,
//                dragMinDistance: 1,
                transform: false,
                swipe: false,
                tap: true
            });
            this._hammer.on("drag", this._hammerDragHandler);
            this._hammer.on("dragstart", this._hammerDragStartHandler);
            this._hammer.on("dragend", this._hammerTapHandler);
            this._hammer.on("tap", this._hammerTapHandler);

            var disableCompass = ()=> {
                if( this._useCompass == null ) {
                    this._useCompass = false;
                }
            };
            if( this._useCompass != false ) {
                Compass.needGPS(disableCompass).needMove(disableCompass).init((enabled:boolean)=>{
                    if( this._useCompass == null && enabled ) {
                        // if undecided only
                        this._useCompass = true;

                        this._compassWatchId = Compass.watch(this._compassWatcher);
                    }
                });

                // attempt to use device orientation
                window.addEventListener("deviceorientation", this._deviceOrientationWatcher);
            }


            this._arenaCanvas = <HTMLCanvasElement>document.getElementById("play-arena");
            this._arenaContext = this._arenaCanvas.getContext("2d");
            this._arenaGradient = this._arenaContext.createRadialGradient(0, 0, this._arenaDiameter/4, 0, 0, this._arenaDiameter/2);
            this._arenaGradient.addColorStop(0, "#ffffff");
            this._arenaGradient.addColorStop(1, "#000000");
            // just clip it now
//            this._arenaContext.moveTo(this._arenaDiameter, this._arenaDiameter/2)
//            this._arenaContext.arc(this._arenaDiameter/2, this._arenaDiameter/2, this._arenaDiameter/2, 0, Math.PI*2);
//            this._arenaContext.closePath();
//            this._arenaContext.clip();
            this._arenaContext.translate(this._arenaDiameter/2, this._arenaDiameter/2);
            super.start();
        }

        public stop() {
            $(window).off("touchmove", this._stopScrollingCallback)
            this._hammer.off("drag", this._hammerDragHandler);
            this._hammer.off("dragstart", this._hammerDragStartHandler);
            this._hammer.off("dragend", this._hammerTapHandler);
            this._hammer.off("tap", this._hammerTapHandler);
            this._level.silence();
            if( this._compassWatchId != null ) {
                Compass.unwatch(this._compassWatchId);
                this._compassWatchId = null;
            }
            window.removeEventListener('deviceorientation', this._deviceOrientationWatcher);
            super.stop();

        }

        public getStateData() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            this._arenaDiameter = Math.min(width, height);
            var data =  new PlayData();
            data.arenaDiameter = this._arenaDiameter;
            return data;
        }

        public render() {

            this._arenaContext.fillStyle = "#000000";
            this._arenaContext.fillRect(-this._arenaDiameter/2, -this._arenaDiameter/2, this._arenaDiameter, this._arenaDiameter);

            // render out the score

            var zAngle = -this._player.getZAngle() - Math.PI/2;
            this._arenaContext.rotate(zAngle);
            var toneSequencer = this._level.getToneSequencer();

            this._arenaContext.strokeStyle = this._arenaGradient;
            this._arenaContext.lineWidth = 1;
            this._arenaContext.globalAlpha  = 0.5;

            for( var x=0; x<this._maxLines; x++) {
                var ax = (x+1) * this._arenaDiameter / (this._maxLines+1) - this._arenaDiameter/2;
                this._arenaContext.beginPath();
                this._arenaContext.moveTo(ax, -this._arenaDiameter/2);
                this._arenaContext.lineTo(ax, this._arenaDiameter/2);
                this._arenaContext.stroke();
            }
            for( var y=0; y<this._maxLines; y++ ) {
                var ay = (y+1) * this._arenaDiameter / (this._maxLines+1) - this._arenaDiameter/2;
                this._arenaContext.beginPath();
                this._arenaContext.moveTo( -this._arenaDiameter/2, ay);
                this._arenaContext.lineTo(this._arenaDiameter/2, ay);
                this._arenaContext.stroke();
            }

            this._arenaContext.globalAlpha = 1;

            if( this._practise || !this._level.playerAlive ) {
                var scale = this._arenaDiameter / (this._level.maxRange * 2);

                var monsters = this._level.getMonsters();
                for( var i in monsters ) {
                    var monster = monsters[i];


                    this._arenaContext.strokeStyle = "#ffffff";
                    var mr = scale * monster.getRadius();
                    var mx = scale * (monster.getX() - this._player.getX());
                    var my = scale * (monster.getY() - this._player.getY());
                    var zangle = monster.getZAngle();
//                    var sin = Math.sin(monster.getZAngle());
//                    var cos = Math.cos(monster.getZAngle());

                    this._arenaContext.translate(mx, my);

                    this._arenaContext.beginPath();

                    var fill;
                    var stroke;
                    var type = monster.getType();
                    switch( type ) {
                        case PlayState.MONSTER_TYPE_CREEPER:
                            this._arenaContext.rotate(zangle);
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.lineTo(-mr, -mr/1.4);
                            this._arenaContext.lineTo(-mr, mr/1.4);
                            this._arenaContext.rotate(-zangle);
                            this._arenaContext.closePath();
                            fill = "#00f";
                            stroke = "#aaf";
                            break;
                        case PlayState.MONSTER_TYPE_DUMMY:
                            var h = Math.sin(monster.getAge() / 500) * mr / 2 + mr;
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.lineTo(0, -h);
                            this._arenaContext.lineTo(-mr, 0);
                            this._arenaContext.lineTo(0, h);
                            this._arenaContext.closePath();
                            fill = "#0f0";
                            stroke = "#afa";
                            break;
                        case PlayState.MONSTER_TYPE_SPINNER:
                            var rangle = monster.getAge() * Math.PI / 1000;
                            this._arenaContext.rotate(rangle);
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.lineTo(mr/4, -mr/4);
                            this._arenaContext.lineTo(0, -mr);
                            this._arenaContext.lineTo(-mr/4, -mr/4);
                            this._arenaContext.lineTo(-mr, 0);
                            this._arenaContext.lineTo(-mr/4, mr/4);
                            this._arenaContext.lineTo(0, mr);
                            this._arenaContext.lineTo(mr/4, mr/4);
                            this._arenaContext.closePath();
                            this._arenaContext.rotate(-rangle);
                            fill = "#b0b";
                            stroke = "#faf";
                            break;
                        case PlayState.MONSTER_TYPE_AMBULANCE:
                            this._arenaContext.rotate(zangle);
                            this._arenaContext.moveTo(mr, mr);
                            this._arenaContext.lineTo(-mr, mr);
                            this._arenaContext.lineTo(-mr, -mr);
                            this._arenaContext.lineTo(mr, -mr);
                            this._arenaContext.closePath();
                            this._arenaContext.rotate(-zangle);
                            fill = "#f00";
                            stroke = "#faa";
                            break;
                        case PlayState.MONSTER_TYPE_BULLET:
                            this._arenaContext.rotate(zangle);
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.lineTo(-mr, -mr/2);
                            this._arenaContext.lineTo(-mr, mr/2);
                            this._arenaContext.closePath();
                            this._arenaContext.rotate(-zangle);
                            stroke = "#ff0";
                            fill = null;
                            break;
                        case PlayState.MONSTER_TYPE_PLAYER:
                            this._arenaContext.rotate(zangle);
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.lineTo(-mr/2, -mr);
                            this._arenaContext.lineTo(-mr, -mr/2);
                            this._arenaContext.lineTo(-mr, mr/2);
                            this._arenaContext.lineTo(-mr/2, mr);
                            this._arenaContext.closePath();
                            this._arenaContext.rotate(-zangle);
                            stroke = "#fff";
                            fill = null;
                            break;
                        default:
                            this._arenaContext.moveTo(mr, 0);
                            this._arenaContext.arc(0, 0, mr, 0, Math.PI*2);
                            fill = null;
                            stroke = "#fff";
                            break;
                    }

                    if( fill && (toneSequencer.isPlaying(monster.getType(), monster) || !this._level.playerAlive ) ) {
                        this._arenaContext.globalAlpha = 0.4;
                        this._arenaContext.fillStyle = fill;
                        this._arenaContext.fill();
                        this._arenaContext.globalAlpha = 1;
                    }
                    this._arenaContext.strokeStyle = stroke;
                    this._arenaContext.stroke();

                    this._arenaContext.translate(-mx, -my);

                    /*
                    this._arenaContext.beginPath();
                    this._arenaContext.moveTo(mx + mr * cos, my + mr * sin);
                    this._arenaContext.lineTo(mx, my);
                    this._arenaContext.stroke();
                    */

                }

            }

            // undo
            this._arenaContext.rotate(-zAngle);
            if( !this._practise ) {
                var fontSize = Math.floor(this._arenaDiameter / 15);
                this._arenaContext.font = fontSize+"px Arial";
                this._arenaContext.fillStyle = "#fff";
                this._arenaContext.textAlign = "left";
                this._arenaContext.fillText("KILLS "+this._level.kills, -this._arenaDiameter / 2, this._arenaDiameter/2 - fontSize);
                var seconds = Math.floor(this._level.age / 1000);
                this._arenaContext.textAlign = "right";
                this._arenaContext.fillText("TIME "+seconds, this._arenaDiameter / 2, this._arenaDiameter/2 - fontSize);
            }
            if( !this._level.playerAlive ) {
                var fontSize = Math.floor(this._arenaDiameter / 15);
                this._arenaContext.font = fontSize+"px Arial";
                // show dead
                this._arenaContext.fillStyle = "#fff";
                this._arenaContext.textAlign = "left";
                var text = "YOU DEFEATED";
                var fm = this._arenaContext.measureText(text);
                this._arenaContext.fillText(text, -fm.width/2, -this._arenaDiameter/2 + fontSize);
            } else if( this._useCompass ) {
                var fontSize = Math.floor(this._arenaDiameter / 30);
                this._arenaContext.font = fontSize+"px Arial";
                this._arenaContext.fillStyle = "#fff";
                this._arenaContext.textAlign = "left";
                this._arenaContext.fillText("compass on", -this._arenaDiameter / 2, -this._arenaDiameter/2 + fontSize);

            }
        }

        public update(updateMillis:number): IState {
            var result;
            if( this._level.playerAlive ) {
                var levelResult = this._level.update(updateMillis);
                if ( levelResult == PlayState.RESULT_LOST ) {
                    // new state
                    result = null;
                    this._level.silence();
                    this._deathTime = (new Date()).getTime();
                } else if( levelResult == PlayState.RESULT_WON ) {
                    // new state
                    result = this._oldState;
                } else {
                    result = null;
                }
            }
            return result;
        }


    }

}