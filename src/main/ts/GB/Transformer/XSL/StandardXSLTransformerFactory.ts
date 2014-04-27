///<reference path="../ITemplateTransformerFactory.ts"/>

module GB.Transformer.XSL {

    export class StandardXSLTransformerFactory<T> implements ITemplateTransformerFactory<T> {

        constructor(private _domParser: DOMParser, private _document: Document, private _toXMLTransformer: (t: T) => Node) {
        }

        preprocess(path: string, node: Node, onSuccess: () => void, onFailure: (e: any) => void) {
            onSuccess();
        }

        createTransformerFromString(template: string): ITransformer<T> {
            var xslNode = this._domParser.parseFromString(template, "text/xml");
            var transformer = this.createTransformerFromNode(xslNode);
            return transformer;
        }

        createTransformerFromNode(xsl: Node): ITransformer<T> {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            return new StandardXSLTransformer<T>(xsltProcessor, this._toXMLTransformer, this._document);
        }

    }

} 