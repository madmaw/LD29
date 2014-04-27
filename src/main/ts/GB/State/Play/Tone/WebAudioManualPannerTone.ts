module GB.State.Play.Tone {

    export class WebAudioManualPannerTone implements ITone {

        private _started: boolean;

        constructor(
            private _target: AudioNode,
            public duration: number,
            private _gainLeft: GainNode,
            private _gainRight: GainNode,
            private _top: AudioNode,
            private _sources: AudioBufferSourceNode[]
        ) {
            this._started = false;
        }

        public play(when:number, times?:number) {
            if( !this._started ) {
                for( var i in this._sources ) {
                    var source = this._sources[i];
                    if( source.noteOn ) {
                        source.noteOn(when / 1000);
                    } else if( source.start ) {
                        source.start(when / 1000);
                    }
                }
                this._started = true;
            }
            this._top.connect(this._target);
            if( times ) {
                this.stop(times * this.duration + when);
            }
        }

        public stop(when: number) {
            for( var i in this._sources ) {
                var source = this._sources[i];
                try {
                    if( source.noteOff ) {
                        source.noteOff(when / 1000);
                    } else if( source.stop ) {
                        source.stop(when / 1000);
                    }
                } catch( e ) {
                    // ignore
                }
            }
            setTimeout(() => {
                // going to be bad
                try {
                    this._top.disconnect();
                } catch( e ) {
                    // ignore
                }
            }, when);
        }

        destroy(when: number): void {
            this.stop(when);
        }

        public setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level) {
            var dsq = x * x + y * y;
            var vsqrt = 1 - (Math.sqrt(dsq) / level.maxRange);
            var v = Math.max(vsqrt * vsqrt, 0);
            var a = Math.atan2(y, x);
            var c1 = Math.abs(Math.sin(Math.PI/4 + a/2));
            var c2 = Math.abs(Math.sin(Math.PI/4 - a/2));
            this._gainRight.gain.value = c1 * v;
            this._gainLeft.gain.value = c2 * v;
        }

    }
}

