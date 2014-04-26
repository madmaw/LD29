declare class XSLTProcessor {

    constructor();

    importStylesheet(xsl: Node): void;

    setParameter(something: string, name: string, value: string);
    setParameter(something: string, name: string, value: number);

    reset(): void;

    transformToFragment(xml: Node, document: Document): Node;

    transformToDocument(xml: Node): Document;

}