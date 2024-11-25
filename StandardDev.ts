export function stdDev(input: number[]): number {
    let sum = input.reduce((prev: number, curr: number) => {
        return prev + curr;
    });

    let average = sum / input.length;

    let variation = input.map((elt) => {
            return elt - average;
        }).map((elt) => {
            return elt * elt;
        }).reduce((prev: number, curr: number) => {
            return prev + (curr / input.length);
    });

    return Math.sqrt(variation);
}

export function test() {
    console.log( "are these plausible standard deviations?");
    let data: number[] = [100,25,30,75,200,150,190,10,40,50];
    let simple: number[] = [2, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 6];
    console.log( stdDev( data ) );
    console.log( stdDev( simple ) );
}