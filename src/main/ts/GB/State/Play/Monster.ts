module GB.State.Play {

    export class Monster {

        private _age:number;
        private _stateAge: number;
        private _velocityX;
        private _velocityY;
        private _velocityZ;

//        public rootAudioNode: AudioNode;
//        public inputAudioNodes: {[_:string]: AudioNode };


        constructor(
            private _mind:IMind,
            public tone: ITone,
            private _type:number,
            private _subtype: number,
            private _state: number,
            private _x:number,
            private _y:number,
            private _z:number,
            private _zAngle: number,
            private _radius:number
        ) {
            this._age = 0;
            this._stateAge = 0;
            this._velocityX = 0;
            this._velocityY = 0;
            this._velocityZ = 0;
        }

        public getRadius() {
            return this._radius;
        }

        public setRadius(radius: number) {
            this._radius = radius;
        }

        public getX() {
            return this._x;
        }

        public getAge() {
            return this._age;
        }

        public getY() {
            return this._y;
        }

        public getZ() {
            return this._z;
        }

        public getVelocityX() {
            return this._velocityX;
        }

        public getVelocityY() {
            return this._velocityY;
        }

        public getVelocityZ() {
            return this._velocityZ;
        }

        public setPosition(x:number, y:number, z:number, vx:number, vy:number, vz:number) {
            this._x = x;
            this._y = y;
            this._z = z;
            this._velocityX = vx;
            this._velocityY = vy;
            this._velocityZ = vz;
        }

        public getState() {
            return this._state;
        }

        public setState(state: number, stateAge:number=0) {
            this._state = state;
            this._stateAge = stateAge;
        }

        public getStateAge() {
            return this._stateAge;
        }

        public getZAngle() {
            return this._zAngle;
        }

        public setZAngle(zAngle: number) {
            this._zAngle = zAngle;
        }

        public getMind() {
            return this._mind;
        }

        public getType() {
            return this._type;
        }

        public age(amount: number) {
            this._age += amount;
            this._stateAge += amount;
        }
    }

} 