module GB.State.Play {

    export interface ITone {

        play(when: number, times?:number): void;

        stop(when: number): void;

        destroy(when: number): void;

        setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level);
    }

}