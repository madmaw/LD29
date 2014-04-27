///<reference path="../ITransformer.ts"/>

module GB.Transformer.XSL {

    export class StandardXSLTransformer<T> implements ITransformer<T> {

        constructor(private _xsltProcessor: XSLTProcessor, private _toXMLTransformer: (t:T)=>Node, private _document: Document) {
        }

        public setParameter(key: string, value: any) {
            // is it an array, we're going to need special handling of that
            var parameterValue;
            if (value instanceof Array) {
                // convert to comma-separated list
                parameterValue = "";
                var first = true;
                for (var i in value) {
                    var v = value[i];
                    if (first) {
                        first = false;
                    } else {
                        parameterValue += ",";
                    }
                    parameterValue += v;
                }
            } else {
                parameterValue = value;
            }
            this._xsltProcessor.setParameter(null, key, parameterValue);
        }

        transform(into: Element, data: T, onCompletion: () => void): void {
            var xml = this._toXMLTransformer(data);
            if (xml == null) {
                // won't transform an empty node
                xml = this._document.createElement("null");
            }
            var output = this._xsltProcessor.transformToFragment(xml, this._document);
            // NOTE output is actually a document fragment, not a node!
            into.appendChild(output);
            if (onCompletion) {
                onCompletion();
            }
        }


    }

}