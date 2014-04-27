module GB.State.Home {

    export class HomeState extends AbstractState<HomeData> {

        constructor(
            template: GB.Transformer.ITransformer<HomeData>, 
            private _playStateFactory: (backState:IState, tutorial: boolean)=>IState,
            private _audioContext: AudioContext
        ) {
            super(template);
        }

        public getStateData() {
            return new HomeData();
        }

        start(): void {
            // add listeners
            document.getElementById("practise").onclick = () => {
                //this.testAudio();
                this.play(true);
            };
            document.getElementById("play").onclick = () => {
                //this.testAudio();
                this.play(false);
            };
            document.getElementById("test-audio").onclick = () => {
                this.testAudio();
            };
        }

        stop(): void {
            // remove listeners
        }

        testAudio() {
            var oscillator = this._audioContext.createOscillator();
            oscillator.frequency.value = 500;
            oscillator.connect(this._audioContext.destination);
            if( oscillator.noteOn ) {
                oscillator.noteOn(0);
            } else if( oscillator.start ) {
                oscillator.start(0);
            }
            if( oscillator.noteOff ) {
                oscillator.noteOff(2);
            } else if( oscillator.stop ) {
                oscillator.stop(2);
            }
        }

        play(practise:boolean): void {
            // launch the play state
            var playState = this._playStateFactory(this, practise);
            this.fireNewStateEvent(playState);
        }


    }

}