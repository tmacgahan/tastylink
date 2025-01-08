// helper lifted from stack overflow to prettyprint maps
export function Replacer(key: any, value: any) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else if(typeof value === 'bigint') {
        return { '__bigintval__': value.toString() };
    } else {
        return value;
    }
}

export function Reviver( key: string, value: any ): any {
    if ( value != null && typeof value === 'object' && '__bigintval__' in value ) {
        return BigInt( value[ '__bigintval__' ] );
    }

    return value;
}