module GB.State.Play {

    export class Level {

        private _monsters: Monster[];
        public age: number;
        public kills: number;
        public playerAlive: boolean;

        constructor(public maxRange: number, private _spawner: ISpawner, private _player: Monster, private _toneSequencer: ToneSequencer) {
            this._monsters = [];
            this.addMonster(this._player);
            this.age = 0;
            this.kills = 0;
            this.playerAlive = true;
        }

        public getToneSequencer() {
            return this._toneSequencer;
        }

        public canAddMonster(type: number) {
            return this._toneSequencer.canAdd(type);
        }

        public addMonster(monster: Monster) {
            this._monsters.push(monster);
            // start off the sounds
            //monster.tone.play();
            this._toneSequencer.add(monster.getType(), monster);
        }

        public getMonsters() {
            return this._monsters;
        }

        public getPlayer() {
            return this._player;
        }

        public update(ticks: number): number {
            this.age += ticks;
            var players = 0;
            var enemies = 0;
            // spawn?
            var newMonsters = this._spawner.spawn(this, ticks);
            for( var i=0; i<newMonsters.length; i++ ) {
                var newMonster = newMonsters[i];
                this.addMonster(newMonster);
            }
            for( var i=this._monsters.length; i>0; ) {
                i--;
                var monster = this._monsters[i];
                monster.age(ticks);
                var mind = monster.getMind();
                if( !mind.think(monster, this, ticks) ) {
                    this._monsters.splice(i, 1);
                    this.silenceMonster(monster);
                } else {
                    if( monster.getType() == PlayState.MONSTER_TYPE_PLAYER ) {
                        players++;
                    } else {
                        enemies++;
                    }
                }
            }
            // check for collisions
            outer: for( var i=this._monsters.length; i>0; ) {
                i--;
                var monster = this._monsters[i];


                var monsterRadius = monster.getRadius();
                for( var j=i; j>0; ) {
                    j--;
                    var otherMonster = this._monsters[j];
                    var otherMonsterRadius = otherMonster.getRadius();
                    var dx = monster.getX() - otherMonster.getX();
                    var dy = monster.getY() - otherMonster.getY();
                    var dsq = dx * dx + dy * dy;
                    var totalRadius = monsterRadius + otherMonsterRadius;
                    var totalRadiusSq = totalRadius * totalRadius;
                    if( totalRadiusSq > dsq ) {
                        // collision!!!
                        var removeMonster = !monster.getMind().handleCollision(monster, otherMonster, this);
                        var removeOtherMonster = !otherMonster.getMind().handleCollision(otherMonster, monster, this);
                        if( removeOtherMonster ) {
                            this._monsters.splice(j, 1);
                            this.silenceMonster(otherMonster);
                            i--;
                        }
                        if( removeMonster ) {
                            this._monsters.splice(i, 1);
                            this.silenceMonster(monster);
                            continue outer;
                        }
                    }
                }


            }

            // update tones
            this._toneSequencer.update(ticks, this);

            var result;
            if( this._spawner.isExpired(this) && enemies == 0 ) {
                result = PlayState.RESULT_WON;
            } else if( players == 0 ) {
                result = PlayState.RESULT_LOST;
                this.playerAlive = false;
            } else {
                result = PlayState.RESULT_UNDECIDED;
            }
            return result;
        }

        public silence() {
            // stop all the sounds!!!
            for( var i in this._monsters ) {
                var monster = this._monsters[i];
                this.silenceMonster(monster);
            }
        }

        public silenceMonster(monster:Monster) {
            if( monster.tone ) {
                //monster.tone.stop();
                this._toneSequencer.remove(monster.getType(), monster);
            }
        }

    }

}