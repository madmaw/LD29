module GB.State.Play.Mind {

    export interface IMonsterFactory {
        (x:number, y:number, z:number, zAngle:number): Monster;
    }
}