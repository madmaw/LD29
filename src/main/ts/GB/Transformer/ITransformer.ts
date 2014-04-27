module GB.Transformer {

    export interface ITransformer<T> {

        transform(into:Element, data:T, onCompletion:()=>void): void;

    }

} 