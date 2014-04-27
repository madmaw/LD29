module GB.State.Play.Spawner {

    export class RandomSpawner implements ISpawner {

        private _heat = 0;

        constructor(
            private _difficulty: number,
            private _minRadius: number,
            private _maxRadius: number,
            private _weights: RandomSpawnerWeight[],
            private _maxDuration?: number
        ) {
        }

        isExpired(level: Level): boolean {
            return this._maxDuration != null && level.age > this._maxDuration;
        }

        spawn(level:Level, delta: number): Monster[] {
            var result = [];
            var progress = Math.min( 1,  Math.sqrt(level.age / 1000) / this._difficulty );
            this._heat += delta * progress / 1000;

            // are we going to spit out a lot?
            if( this._heat > 1 ) {

                var totalWeight = 0;
                for( var i in this._weights ) {
                    var weight = this._weights[i];
                    var maxQuantity = weight.maxQuantityMultiplier * level.age;
                    if( maxQuantity >= 1 ) {
                        totalWeight += weight.weight;
                    }
                }

                // create some monsters
                var monsterWeight = Math.random() * totalWeight * progress;
                for( var i in this._weights ) {
                    var weight = this._weights[i];
                    var maxQuantity = weight.maxQuantityMultiplier * level.age;
                    if( maxQuantity >= 1 ) {
                        monsterWeight -= weight.weight;
                    }
                    if( monsterWeight <= 0 ) {
                        // we have our monster
                        var quantity = 1;
                        while( quantity > 0 && this._heat > 0 && level.canAddMonster(weight.type) )  {
                            this._heat -= weight.coolDownValue;

                            var mind = weight.mindFactory();
                            var r = this._minRadius + (this._maxRadius - this._minRadius) * Math.random();
                            var a = Math.PI * 2 * Math.random();
                            var mx = Math.cos(a) * r;
                            var my = Math.sin(a) * r;
                            var mz = 0;
                            var tone = weight.toneFactory();
                            var monster = new Monster(
                                mind,
                                tone,
                                weight.type,
                                weight.subtype,
                                PlayState.MONSTER_STATE_SPAWNED,
                                mx, my, mz, a - Math.PI, 7
                            );
                            result.push(monster);
                        }
                        break;
                    }
                }
            }
            return result;
        }

    }
}