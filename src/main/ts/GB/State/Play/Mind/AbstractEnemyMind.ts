module GB.State.Play.Mind {


    export class AbstractEnemyMind implements IMind {

        constructor(
            private _explosionFactory:IMonsterFactory,
            private _summoningSicknessDuration:number,
            private _deathDuration:number
        ) {

        }

        think(monster:Monster, level:Level, ticks: number): boolean {
            var state = monster.getState();
            if( state == PlayState.MONSTER_STATE_SPAWNED ) {
                var stateAge = monster.getStateAge();
                if( stateAge > this._summoningSicknessDuration ) {
                    ticks = stateAge - this._summoningSicknessDuration;
                    monster.setState(PlayState.MONSTER_STATE_NORMAL, ticks);
                } else {
                    ticks = 0;
                }
            } else if( state == PlayState.MONSTER_STATE_DYING ) {
                var stateAge = monster.getStateAge();
                if( stateAge > this._deathDuration ) {
                    // disappear
                    return false;
                } else {
                    ticks = 0;
                }
            }
            if( ticks > 0 ) {
                return this.thinkFreely(monster, level, ticks);
            } else {
                return true;
            }
        }

        thinkFreely(monster:Monster, level:Level, ticks: number): boolean {
            return true;
        }

        handleCollision(monster: Monster, withMonster:Monster, level:Level): boolean {
            var withMonsterType = withMonster.getType();
            var dead = (withMonsterType == PlayState.MONSTER_TYPE_BULLET);
            if( dead ) {
                // fukken explode
                if( this._explosionFactory ) {
                    var explosion = this._explosionFactory(monster.getX(), monster.getY(), monster.getZ(), monster.getZAngle());
                    level.addMonster(explosion);
                }
                level.kills ++;
            }
            return !dead;
        }


    }
}