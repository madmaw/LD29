module GB.Util {

    export function removeFromArray<T>(t:T, a:T[]): boolean {

        var result = false;
        for (var i = a.length; i > 0;) {
            i--;
            var e = a[i];
            if (e == t) {
                a.splice(i, 1);
                result = true;
                break;
            }
        }
        return result;
    }

} 