module GB.State.Play.Tone {

    export class NoTone implements ITone {

        constructor(public duration: number) {

        }

        play(when: number, times?:number): void {

        }

        stop(when: number): void {

        }

        destroy(when: number): void {

        }

        setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level) {

        }

    }

}