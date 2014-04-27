module GB.Transformer {

    export interface ITemplateTransformerFactory<T> {

        createTransformerFromString(template: string): ITransformer<T>;

    }

} 