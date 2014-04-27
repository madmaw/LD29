module GB.Transformer {

    export function createTransformerFactoryFromString<T>(transformerFactory: ITemplateTransformerFactory<T>, templateString: string): ITransformerFactory<T> {
        return function () {
            return transformerFactory.createTransformerFromString(templateString);
        };
    }

    export interface ITransformerFactory<T> {
        (): ITransformer<T>;
    }

} 