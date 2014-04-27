module GB.State.Play {

    export interface IMind {

        think(monster:Monster, level:Level, ticks: number): boolean;

        handleCollision(monster:Monster, withMonster:Monster, level:Level): boolean;
    }

}