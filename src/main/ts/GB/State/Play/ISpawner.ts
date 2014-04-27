module GB.State.Play {

    export interface ISpawner {

        isExpired(level: Level): boolean;

        spawn(level:Level, delta: number): Monster[];

    }
}