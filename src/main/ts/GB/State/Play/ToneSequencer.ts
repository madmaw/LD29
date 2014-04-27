module GB.State.Play {

    export class ToneSequencer {

        private _uncontrolledMonsters: Monster[];

        constructor(private _bars: {[_:number]: ToneSequencerBar}) {
            this._uncontrolledMonsters = [];
        }

        public canAdd(barId: number): boolean {
            var bar = this._bars[barId];
            var result;
            if( bar != null ) {
                result = false;
                for( var i in bar.monsters ) {
                    var monster = bar.monsters[i];
                    if( monster == null ) {
                        result = true;
                        break;
                    }
                }
            } else {
                result = false;
            }
            return result;
        }

        public add(barId: number, monster:Monster) {
            var bar = this._bars[barId];
            if( bar != null ) {
                for( var i in bar.monsters ) {
                    var existingMonster = bar.monsters[i];
                    if( existingMonster == null ) {
                        bar.monsters[i] = monster;
                        if( i == bar.index ) {
                            // start playing
                            monster.tone.play(0);
                        }
                        break;
                    }
                }
            } else {
                // TODO set position
                monster.tone.play(0);
                this._uncontrolledMonsters.push(monster);
            }

        }

        public remove(barId: number, monster: Monster) {
            var bar = this._bars[barId];
            if( bar != null ) {
                var index = bar.monsters.indexOf(monster);
                if( index >= 0 ) {
                    // stop the monster playing
                    monster.tone.destroy(0);
                    bar.monsters[index] = null;
                }
            } else {
                monster.tone.destroy(0);
                var index = this._uncontrolledMonsters.indexOf(monster);
                if( index >= 0 ) {
                    this._uncontrolledMonsters.splice(index, 1);
                }
            }
        }

        public isPlaying(barId: number, monster: Monster) {
            var bar = this._bars[barId];
            var result;
            if( bar != null ) {
                var index = bar.monsters.indexOf(monster);
                result = index == bar.index;
            } else {
                result = false;
            }
            return result;
        }

        public update(millis: number, level: Level) {
            var player = level.getPlayer();
            var playerX = player.getX();
            var playerY = player.getY();
            var playerZ = player.getZ();
            var playerAngleZ = player.getZAngle();
            var playerAngleZSin = Math.sin(-playerAngleZ);
            var playerAngleZCos = Math.cos(-playerAngleZ);

            for( var barId in this._bars ) {
                var bar = this._bars[barId];
                var remainder = level.age % bar.totalDuration;
                var index = Math.ceil(remainder / bar.toneDuration)%bar.size;
                var monster: Monster;
                if( index != bar.index ) {
                    var toneRemainder = remainder % bar.toneDuration;

                    var previousMonster = bar.monsters[bar.index];
                    if( previousMonster != null ) {
                        // TODO tracking stops for this guy!
                        previousMonster.tone.stop(toneRemainder);
                    }
                    bar.index = index;
                    monster = bar.monsters[index];
                    if( monster != null ) {
                        monster.tone.play(toneRemainder);
                    }
                } else {
                    monster = bar.monsters[index];
                }
                if( monster != null ) {
                    // set position
                    var x = monster.getX() - playerX;
                    var y = monster.getY() - playerY;

                    var rx = x * playerAngleZCos - y * playerAngleZSin;
                    var ry = x * playerAngleZSin + y * playerAngleZCos;

                    monster.tone.setPosition(rx, ry, playerZ, 0, 0, 0, level);
                }
            }


            for( var i in this._uncontrolledMonsters ) {
                var monster = this._uncontrolledMonsters[i];
                // set position
                var x = monster.getX() - playerX;
                var y = monster.getY() - playerY;

                var rx = x * playerAngleZCos - y * playerAngleZSin;
                var ry = x * playerAngleZSin + y * playerAngleZCos;

                monster.tone.setPosition(rx, ry, playerZ, 0, 0, 0, level);
            }
        }
    }

}