module GB.State.Play.Tone {

    export class OneShotToneProxy implements ITone {

        private _activeTones:ITone[];
        private _currentTone: ITone;
        private _x: number;
        private _y: number;
        private _z: number;
        private _vx: number;
        private _vy: number;
        private _vz: number;
        private _level: Level;

        constructor(private _toneFactory: IToneFactory, public duration: number) {
            this._activeTones = [];
        }

        play(when: number, times?:number): void {
            this._currentTone = this._toneFactory();
            this._activeTones.push(this._currentTone);
            if( this._level != null ) {
                this._currentTone.setPosition(this._x, this._y, this._z, this._vx, this._vy, this._vz, this._level);
            }
            this._currentTone.play(when, times);
        }

        stop(when: number): void {
            if( this._currentTone ) {
                this._currentTone.stop(when);
                this._currentTone = null;
            }
        }

        destroy(when: number): void {
            for( var i in this._activeTones ) {
                var activeTone = this._activeTones[i];
                activeTone.destroy(when);
            }
            this._activeTones = null;
        }

        setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level) {
            this._x = x;
            this._y = y;
            this._z = z;
            this._vx = vx;
            this._vy = vy;
            this._vz = vz;
            this._level = level;
            for( var i in this._activeTones ) {
                var activeTone = this._activeTones[i];
                activeTone.setPosition(x, y, z, vx, vy, vz, level);
            }
        }

    }

}