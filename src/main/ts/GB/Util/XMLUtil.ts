module GB.Util {

    export function readXML(path: string, onSuccess: (node: Node) => void, onFailure: (e: any) => void) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            onSuccess(xhr.responseXML);
        };
        xhr.onerror = function (e: ErrorEvent) {
            onFailure(e);
        };
        xhr.open("GET", path, true);
        xhr.send(null);
    }

    export function toXML(o: any, name?: string, filter?: (o: any, propertyName: string) => boolean, indexNames?: { [_: string]: string[] }, tab?: string, indent?: string, index?: string, indexDepth?: number) {
        if (name == null && o != null) {
            name = getClassName(o);
        }

        var xml;
        var type = typeof o;
        var isFunction = type == "function";
        if (name != null && !isFunction) {
            var isArray = o instanceof Array;
            var isLiteral = type == "number" || type == "string" || type == "boolean";
            var isUndefined = type == "undefined" && !isArray;
            var encloseInTags = !isArray || indexDepth != null;

            if (tab == null) {
                tab = '\t';
            }
            if (indent == null) {
                indent = "";
            }

            xml = indent;
            if (encloseInTags) {
                xml += "<" + name;
                if (index != null) {
                    if (indexNames != null) {
                        var names = indexNames[name];
                        if (names != null && names.length > indexDepth) {
                            var indexName = names[indexDepth];
                            // don't bother otherwise, you can just look it up by position in XML, which is just as effective
                            xml += " " + indexName + "=\"" + index + "\"";
                        }
                    }
                }
            }
            if (isUndefined) {
                // do nothing
                xml += "/>\n";
            } else {
                if (encloseInTags) {
                    xml += ">";
                }
                if (isLiteral) {
                    xml += o;
                } else {
                    xml += "\n";
                    if (indexDepth == null) {
                        indexDepth = 0;
                    } else {
                        indexDepth++;
                    }
                    for (var i in o) {
                        if (filter == null || filter(o, i)) {
                            var e = o[i];
                            var s;
                            if (isArray) {
                                s = toXML(e, name, filter, indexNames, tab, indent + tab, i, indexDepth);
                            } else {
                                // only get the non-prototype properties
                                if (i != "prototype") {
                                    var propertyName = i;
                                    if (propertyName.indexOf('_') == 0) {
                                        // remove leading underscore we use for "private" variables
                                        propertyName = propertyName.substring(1);
                                    }
                                    s = toXML(e, propertyName, filter, indexNames, tab, indent + tab);
                                } else {
                                    s = null;
                                }
                            }
                            if (s != null) {
                                xml += s;
                            }
                        }
                    }
                    xml += indent;
                }
                if (encloseInTags) {
                    xml += "</" + name + ">\n";
                }
            }
        } else {
            xml = null;
        }
        return xml;
    }

}