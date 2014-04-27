module GB.State.Play.Tone {

    export class WebAudioManualPannerToneProxy implements ITone {

        private _gain: GainNode;
        private _gainLeft: GainNode;
        private _gainRight: GainNode;
        private _merger: AudioNode;

        constructor(
            public attackTimeSeconds:number,
            public attackVolume: number,
            public decayTimeSeconds: number,
            public decayVolume: number,
            public fadeTimeSeconds: number,
            private _audioContext:AudioContext,
            private _proxiedSource: AudioNode,
            private _proxied?: ITone) {

            this._gainLeft = _audioContext.createGainNode();
            this._gainLeft.gain.value = 1;
            _proxiedSource.connect(this._gainLeft);

            this._gainRight = _audioContext.createGainNode();
            this._gainRight.gain.value = 1;
            _proxiedSource.connect(this._gainRight);

            this._merger = _audioContext.createChannelMerger(2);
            this._gainLeft.connect(this._merger, 0, 0);
            this._gainRight.connect(this._merger, 0, 1);

            this._gain = _audioContext.createGainNode();
            this._gain.gain.value = 0;
            this._merger.connect(this._gain);
        }

        public getSource():AudioNode {
            return this._gain;
        }

        play(when: number, times?:number): void {
            var now = this._audioContext.currentTime;

            this._gain.gain.cancelScheduledValues(now);
            this._gain.gain.setValueAtTime(this._gain.gain.value, now);
            //attack
            this._gain.gain.linearRampToValueAtTime(this.attackVolume, now + this.attackTimeSeconds);
            //decay
            this._gain.gain.linearRampToValueAtTime(this.decayVolume, now + this.attackTimeSeconds + this.decayTimeSeconds);
            if( this._proxied ) {
                this._proxied.play(when, times);
            }
        }

        stop(when: number): void {
            //get current time from audio context to schedule changes now
            var now = this._audioContext.currentTime;

            this._gain.gain.cancelScheduledValues(0.0);

            //release
            this._gain.gain.setValueAtTime(this._gain.gain.value, now);
            this._gain.gain.linearRampToValueAtTime(0.0, now + this.fadeTimeSeconds);
            if( this._proxied ) {
                this._proxied.stop(when);
            }
        }

        destroy(when: number): void {
            if( this._proxied ) {
                this._proxied.destroy(when);
            }
            // detach
            this._gain.disconnect();
        }

        setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level) {
            // deal with it
            var dsq = x * x + y * y;
            var vsqrt = 1 - (Math.sqrt(dsq) / level.maxRange);
            var v = Math.pow(vsqrt, 1.5);
            var a = Math.atan2(y, x);
            var c1 = Math.abs(Math.sin(Math.PI/4 + a/2));
            var c2 = Math.abs(Math.sin(Math.PI/4 - a/2));
            this._gainRight.gain.value = c1 * v;
            this._gainLeft.gain.value = c2 * v;
        }


    }

}