module GB.State {

    export interface IStateListener {

        (oldState:IState, newState:IState): void;

    }

} 