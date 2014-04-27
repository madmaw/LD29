///<reference path="DummyMind.ts"/>

module GB.State.Play.Mind {

    export class BulletMind extends DummyMind {

        constructor(summoningSicknessDuration: number, deathDuration: number, speed:number) {
            super(null, summoningSicknessDuration, deathDuration, speed);
        }


        handleCollision(monster: Monster, withMonster:Monster, level:Level): boolean {
            var withMonsterType = withMonster.getType();
            // TODO add in explosions
            return ( withMonsterType == PlayState.MONSTER_TYPE_BULLET || withMonsterType == PlayState.MONSTER_TYPE_PLAYER || withMonsterType == PlayState.MONSTER_TYPE_EXPLOSION );
        }

    }

}