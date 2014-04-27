module GB.State.Play.Mind {


    export class PlayerInput {

        private _down: boolean;
        private _read: boolean;

        constructor() {
            this._read = true;
            this._down = false;
        }

        public read(): boolean {
            var read = this._read;
            this._read = true;
            return !read || this._down;
        }

        public set() {
            this._down = true;
            this._read = false;
        }

        public unset() {
            this._down = false;
        }

    }

}