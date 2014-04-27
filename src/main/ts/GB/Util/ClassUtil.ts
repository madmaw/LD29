module GB.Util {

    export function getClassName(o: any): string {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(o.constructor.toString());
        return (results && results.length > 1) ? results[1] : null;
    }

} 