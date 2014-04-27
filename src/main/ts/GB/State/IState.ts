module GB.State {

    export interface IState {

        init(container: Element, onInitialized: () => void): void;

        requestLayout();

        start(): void;

        stop(): void;

        addStateListener(stateListener:IStateListener): void;

        removeStateListener(stateListener: IStateListener): void;

    }

} 