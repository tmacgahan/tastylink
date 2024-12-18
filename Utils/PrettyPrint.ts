// helper lifted from stack overflow to prettyprint maps
export function Replacer(key: any, value: any) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
    return value;
    }
}