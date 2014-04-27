module GB.State.Play.Mind {

    export class ExplosionMind implements IMind {

        constructor(private _maxExplosionAge:number, private _maxExplosionRadius: number) {

        }

        think(monster:Monster, level:Level, ticks: number): boolean {
            // expand the radius
            var radius = this._maxExplosionRadius * monster.getAge() / this._maxExplosionAge;
            monster.setRadius(radius);
            return monster.getAge() <= this._maxExplosionAge;
        }

        handleCollision(monster: Monster, withMonster:Monster, level:Level): boolean {
            // don't care
            return true;
        }

    }

}