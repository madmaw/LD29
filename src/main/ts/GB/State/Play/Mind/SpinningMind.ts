module GB.State.Play.Mind {

    export class SpinningMind extends AbstractEnemyMind {

        constructor(
            explosionFactory:IMonsterFactory,
            summoningSicknessDuration: number,
            deathDuration: number,
            private _orbitSpeed:number,
            private _decaySpeed:number,
            private _cw: boolean
        ) {
            super(
                explosionFactory,
                summoningSicknessDuration,
                deathDuration
            );
        }

        thinkFreely(monster:Monster, level:Level, ticks: number): boolean {
            var x = monster.getX();
            var y = monster.getY();
            var r = Math.sqrt( x * x + y * y );
            var a = Math.atan2(y, x);
            var c = Math.PI * 2 * r;
            var dorbit = ticks * this._orbitSpeed;
            var dangle = (dorbit * Math.PI * 2) / c;
            var tangle;
            var fangle;
            if( this._cw ) {
                tangle = a + dangle;
                fangle = tangle + Math.PI/2;
            } else {
                tangle = a - dangle;
                fangle = tangle - Math.PI/2;
            }
            var tr = r - this._decaySpeed * ticks;
            var tx = tr * Math.cos(tangle);
            var ty = tr * Math.sin(tangle);
            monster.setPosition(tx, ty, 0, 0, 0, 0);
            monster.setZAngle(fangle);
            return tr > monster.getRadius();
        }
    }

}