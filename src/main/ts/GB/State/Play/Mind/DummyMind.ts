module GB.State.Play.Mind {

    export class DummyMind extends AbstractEnemyMind {

        constructor(
            explosionFactory:IMonsterFactory,
            summoningSicknessDuration: number,
            deathDuration: number,
            private _speed:number
        ) {
            super(
                explosionFactory,
                summoningSicknessDuration,
                deathDuration
            );
        }

        thinkFreely(monster:Monster, level:Level, ticks: number): boolean {
            var sin = Math.sin(monster.getZAngle());
            var cos = Math.cos(monster.getZAngle());
            // lazy collision handling, you can't move further than your own diameter
            var d = Math.min(this._speed * ticks, monster.getRadius() * 2);
            var dx = cos * d;
            var dy = sin * d;
            var x = monster.getX() + dx;
            var y = monster.getY() + dy;

            var dsq = x * x + y * y;
            monster.setPosition(x, y, 0, dx / ticks, dy / ticks, 0);
            return dsq <= level.maxRange * level.maxRange;
        }
    }

}