module GB.State {

    export class StateEngine {

        private _currentState: IState;
        private _stateListener: IStateListener;

        constructor(private _container:Element) {
            this._stateListener = (oldState: IState, newState: IState) => {
                if (oldState != newState) {
                    this.setCurrentState(newState);
                }
            };
            window.onresize = () => {
                if( this._currentState ) {
                    this._currentState.requestLayout();
                }
            }
        }

        setCurrentState(currentState: IState) {
            if (this._currentState) {
                this._currentState.removeStateListener(this._stateListener);
                this._currentState.stop();
                // TODO animate out old view
            }
            this._currentState = currentState;
            if (this._currentState) {
                this._currentState.addStateListener(this._stateListener);
                // TODO animate in new view
                this._currentState.init(this._container, () => {
                    this._currentState.start();
                });
            }
        }

    }

}