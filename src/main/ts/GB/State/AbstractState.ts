///<reference path="IState.ts"/>

module GB.State {

    export class AbstractState<T> implements IState {

        private _stateListeners: IStateListener[];
        private _container: Element;


        constructor(private _template: GB.Transformer.ITransformer<T>) {
            this._stateListeners = [];
        }

        init(container: Element, onInitialized:()=>void) {
            this._container = container;
            this.layout(this.getStateData(), onInitialized);
        }

        requestLayout() {
            this.stop();
            this.layout(this.getStateData());
            this.start();
        }

        getStateData(): T {
            return null;
        }

        start(): void {

        }

        stop(): void {

        }

        addStateListener(stateListener: IStateListener): void {
            this._stateListeners.push(stateListener);
        }

        removeStateListener(stateListener: IStateListener): void {
            var index = this._stateListeners.indexOf(stateListener);
            if (index >= 0) {
                this._stateListeners.splice(index, 1);
            }
        }

        fireNewStateEvent(newState: IState): void {
            for (var i = this._stateListeners.length; i > 0;) {
                i--;
                var stateListener = this._stateListeners[i];
                stateListener(this, newState);
            }
        }

        layout(data?: T, onCompletion?: () => void) {
            // remove all from container
            while (this._container.firstChild) {
                this._container.removeChild(this._container.firstChild);
            }
            this._template.transform(this._container, data, () => {
                this.attach(this._container);
                if (onCompletion) {
                    onCompletion();
                }
            });
        }

        attach(container: Element) {

        }

        fail(message: string, e: any) {
            console.error(message);
            console.error(e);
        }
    }

} 