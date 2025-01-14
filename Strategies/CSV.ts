export class CSV implements Iterable<string[]>{
    private header: Map<String, number>
    private rows: string[][]

    constructor(...cols: string[]) {
        this.rows = Array()
        this.header = new Map<String, number>()
        cols.forEach( (col, idx) => this.header.set(col, idx) )
        this.rows.push( cols )
    }

    push(...row: string[]) {
        if( this.header.size != row.length ) {
            throw new Error(`tried to push row with ${row.length} columns but expected ${this.header} columns`)
        }

        this.rows.push(row)
    }

    length(): number {
        return this.rows.length - 1
    }

    row(index: number): string[] {
        if( index < 0 || index >= this.rows.length - 1 ) {
            throw new Error( `requested index ${index} on a structure of length ${this.rows.length - 1}` )
        }

        return this.rows[index + 1]
    }

    sortBy(column: string, ascending: boolean = true) {
        if( !this.header.has(column) ) {
            throw new Error(`trying to access column ${column} but available columns are ${this.header.keys}`)
        }

        const colNum = this.header.get(column) as number
        const head = this.rows[0]
        const tail = this.rows.slice(1)

        if( ascending ) {
            tail.sort((a, b) => a[colNum].localeCompare(b[colNum]))
        } else  {
            tail.sort((a, b) => b[colNum].localeCompare(a[colNum]))
        }

        this.rows = [head, ...tail]
    }

    [Symbol.iterator](): Iterator<string[]> {
        let index = 1
        const rows = this.rows

        return {
            next(): IteratorResult<string[]> {
                if (index < rows.length) {
                    return { value: rows[index++], done: false }
                } else {
                    return { done: true, value: undefined }
                }
            }
        }
    }

    rowStringsWithHeader(): Iterable<string> {
        const rows = this.rows
        return new class implements Iterable<string> {
            [Symbol.iterator](): Iterator<string> {
                let index = 0

                return {
                    next: (): IteratorResult<string> => {
                        if (index < rows.length) {
                            const result = rows[index++].reduce( (acc, curr) => `${acc}${acc === "" ? "" : ", "}${curr}`, "" )
                            return {
                                value: result, done: false
                            }
                        } else {
                            return { value: undefined, done: true }
                        }
                    }
                }
            }
        }
    }

    toString(): string {
        return Array.from(this.rowStringsWithHeader()).reduce( (acc, cur) => `${acc}${acc === "" ? "" : "\n"}${cur}`, "" )
    }
}