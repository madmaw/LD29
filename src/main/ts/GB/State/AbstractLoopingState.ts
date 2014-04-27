///<reference path="AbstractState.ts"/>

module GB.State {

    export class AbstractLoopingState<T> extends AbstractState<T> {

        private _animationFrameHandle: number;
        private _previousTimestamp: number;

        start(): void {
            var callUpdate = (timestamp) => {
                var newState = null;
                if (this._previousTimestamp) {
                    var diff = timestamp - this._previousTimestamp;
                    newState = this.update(diff);
                }
                this._previousTimestamp = timestamp;
                this.render();
                if( newState != null && newState != this ) {
                    this.fireNewStateEvent(newState);
                } else {
                    this._animationFrameHandle = window.requestAnimationFrame(callUpdate);
                }
            };
            // TODO set the previousTimestamp value from somewhere
            this.render();
            this._animationFrameHandle = window.requestAnimationFrame(callUpdate);
        }

        stop(): void {
            if (this._animationFrameHandle) {
                window.cancelAnimationFrame(this._animationFrameHandle);
                this._animationFrameHandle = null;
            }
            this._previousTimestamp = null;
        }

        forceUpdate(): void {
            this.update(0);
            this.render();
        }

        update(updateMillis:number): IState {
            return null;
        }

        render(): void {

        }

    }

} 