module GB.State.Play.Mind {

    export class PlayerMind implements IMind {

        private _targetZAngle: number;

        private _inputs:{[_:string]:PlayerInput};

        constructor(private _bulletFactory:IMonsterFactory) {
            this._targetZAngle = 0;
            this._inputs = {};
        }

        public setTargetZAngle(targetZAngle: number) {
            this._targetZAngle = targetZAngle;
        }

        public setInput(inputKey:string) {
            var input = this._inputs[inputKey];
            if( input == null ) {
                input = new PlayerInput();
                this._inputs[inputKey] = input;
            }
            input.set();
        }

        public unsetInput(inputKey: string) {
            var input = this._inputs[inputKey];
            if( input != null ) {
                input.unset();
            }
        }

        think(monster:Monster, level:Level, ticks: number): boolean {
            // max turning speed?
            monster.setZAngle(this._targetZAngle);
            // fire as required
            var fireInput = this._inputs[PlayState.INPUT_FIRE];
            // assume it adds bullets
            if( fireInput ) {
                if( fireInput.read() ) {
                    var angle = monster.getZAngle();
                    var radius = monster.getRadius();
                    var sin = Math.sin(angle);
                    var cos = Math.cos(angle);
                    var dx = cos * radius;
                    var dy = sin * radius;
                    var bullet = this._bulletFactory(monster.getX() + dx, monster.getY() + dy, monster.getZ(), monster.getZAngle());
                    if( level.canAddMonster(bullet.getType()) ) {
                        level.addMonster(bullet);
                    }
                }
            }
            return true;
        }

        handleCollision(monster: Monster, withMonster:Monster, level:Level): boolean {
            var withMonsterType = withMonster.getType();
            return ( withMonsterType == PlayState.MONSTER_TYPE_BULLET || withMonsterType == PlayState.MONSTER_TYPE_PLAYER || withMonsterType == PlayState.MONSTER_TYPE_EXPLOSION);
        }


    }
}