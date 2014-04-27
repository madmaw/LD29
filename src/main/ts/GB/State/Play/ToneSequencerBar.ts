module GB.State.Play {

    export class ToneSequencerBar {

        public monsters: Monster[];
        public index: number;
        public totalDuration: number;

        constructor(public size:number, public toneDuration:number) {
            this.monsters = [];
            for( var i=0; i<size; i++ ) {
                this.monsters.push(null);
            }
            this.index = null;
            this.totalDuration = toneDuration * size;
        }


    }

}