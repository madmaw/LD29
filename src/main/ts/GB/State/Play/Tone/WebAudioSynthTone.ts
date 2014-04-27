module GB.State.Play.Tone {

    export class WebAudioSynthTone implements ITone {

        private _oscillator: OscillatorNode;
        private _filter: BiquadFilterNode;
        private _lfo: OscillatorNode;
        private _osciFOGain: GainNode;


        constructor(
            public frequency: number,
            public oscillatorType: number,
            public lfoType: number,
            public lfoFrequency: number,
            public osciFOGain: number,
            private _audioContext: AudioContext
        ) {
            this._oscillator = _audioContext.createOscillator();
            this._oscillator.frequency.value = frequency;
            this._oscillator.type = oscillatorType;

            this._oscillator.noteOn(0);

            this._filter = _audioContext.createBiquadFilter();
            this._filter.frequency.value = 5000;
            this._filter.type = 0;

            this._oscillator.connect(this._filter);

            this._lfo = _audioContext.createOscillator();
            this._lfo.type = lfoType;
            this._lfo.frequency.value = lfoFrequency;
            this._lfo.noteOn(0);

            this._osciFOGain = _audioContext.createGainNode();
            this._osciFOGain.gain.value = osciFOGain;
            this._lfo.connect(this._osciFOGain);
            this._osciFOGain.connect(this._oscillator.detune);
        }

        public getSource(): AudioNode {
            return this._filter;
        }

        setFilterFrequency(filterFrequency: number) {
            var now = this._audioContext.currentTime;
            // Clamp the frequency between the minimum value (40 Hz) and half of the
            // sampling rate.
            var minValue = 40;
            var maxValue = 44100 / 2;
            // Logarithm (base 2) to compute how many octaves fall in the range.
            var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
            // Compute a multiplier from 0 to 1 based on an exponential scale.
            var multiplier = Math.pow(2, numberOfOctaves * (filterFrequency - 1.0));

            // Get back to the frequency value between min and max.
            this._filter.frequency.setValueAtTime(maxValue * multiplier, now);
        }

        setFilterResonance(filterResonance: number) {
            //get current time from audio context to schedule changes now
            var now = this._audioContext.currentTime;

            //set filter Q now
            this._filter.Q.setValueAtTime(filterResonance * 30, now);
        }

        play(when: number, times?:number): void {
            // always playing
        }

        stop(when: number): void {
        }

        destroy(when: number): void {
            this._oscillator.noteOff(0);
            this._lfo.noteOff(0);
            this._filter.disconnect();
        }

        setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number, level: Level) {
            // do nothing, we assume we're going to be proxied to handle that
        }


    }

}