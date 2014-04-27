module GB.State.Play {

    export class PlayState extends AbstractLoopingState<PlayData> {

        public static MONSTER_TYPE_PLAYER = 0;
        public static MONSTER_TYPE_DUMMY = 1;
        public static MONSTER_TYPE_BULLET = 2;
        public static MONSTER_TYPE_EXPLOSION = 3;
        public static MONSTER_TYPE_CREEPER = 4;
        public static MONSTER_TYPE_SPINNER = 5;

        public static MONSTER_TYPE_PLAYER_SUBTYPE_P1 = 0;
        public static MONSTER_TYPE_DUMMY_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_BULLET_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_EXPLOSION_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_CREEPER_SUBTYPE_NORMAL = 0;
        public static MONSTER_TYPE_SPINNER_SUBTYPE_NORMAL = 0;

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

        constructor(
            template: GB.Transformer.ITransformer<PlayData>,
            private _practise: boolean,
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
                    var sin = Math.sin(monster.getZAngle());
                    var cos = Math.cos(monster.getZAngle());

                    this._arenaContext.beginPath();
                    this._arenaContext.moveTo(mx + mr, my);
                    this._arenaContext.arc(mx, my, mr, 0, Math.PI*2);
                    this._arenaContext.stroke();
                    if( toneSequencer.isPlaying(monster.getType(), monster) || !this._level.playerAlive ) {
                        var type = monster.getType();
                        var fill;
                        switch( type ) {
                            case PlayState.MONSTER_TYPE_CREEPER:
                                fill = "#00f";
                                break;
                            case PlayState.MONSTER_TYPE_DUMMY:
                                fill = "#0f0";
                                break;
                            case PlayState.MONSTER_TYPE_SPINNER:
                                fill = "#f00";
                                break;
                            default:
                                fill = "#000";
                                break;
                        }

                        this._arenaContext.fillStyle = fill;
                        this._arenaContext.fill();
                    }

                    this._arenaContext.beginPath();
                    this._arenaContext.moveTo(mx + mr * cos, my + mr * sin);
                    this._arenaContext.lineTo(mx, my);
                    this._arenaContext.stroke();

                }

            }

            // undo
            this._arenaContext.rotate(-zAngle);
            var fontSize = Math.floor(this._arenaDiameter / 15);
            if( !this._practise ) {
                this._arenaContext.font = fontSize+"px Arial";
                this._arenaContext.fillStyle = "#fff";
                this._arenaContext.textAlign = "left";
                this._arenaContext.fillText("KILLS "+this._level.kills, -this._arenaDiameter / 2, this._arenaDiameter/2 - fontSize);
                var seconds = Math.floor(this._level.age / 1000);
                this._arenaContext.textAlign = "right";
                this._arenaContext.fillText("TIME "+seconds, this._arenaDiameter / 2, this._arenaDiameter/2 - fontSize);
            }
            if( !this._level.playerAlive ) {
                // show dead
                this._arenaContext.font = fontSize+"px Arial";
                this._arenaContext.fillStyle = "#fff";
                this._arenaContext.textAlign = "left";
                var text = "YOU DEFEATED";
                var fm = this._arenaContext.measureText(text);
                this._arenaContext.fillText(text, -fm.width/2, -this._arenaDiameter/2 + fontSize);
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