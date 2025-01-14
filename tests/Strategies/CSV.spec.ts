import { expect } from 'chai'
import 'mocha';
import { CSV } from '../../Strategies/CSV';

describe('CSV', () => {
    const stringForm = "alpha, bravo, charlie\n1, 2, 3\n4, 5, 6"
    const reverseForm = "alpha, bravo, charlie\n4, 5, 6\n1, 2, 3"
    const csv = new CSV( "alpha", "bravo", "charlie" )
    csv.push( "1", "2", "3" )
    csv.push( "4", "5", "6" )

    it('correctly builds a csv', () => {
        expect(csv.length()).to.equal(2)
        expect(csv.row(0)).deep.equal(["1", "2", "3"])
        expect(csv.row(1)).deep.equal(["4", "5", "6"])
    })

    it('maps properly', () => {
        expect(Array.from(csv)
            .map( row => row.reduce( (acc, cur) => acc + cur, "" ) )
            .reduce( (acc, cur) => acc + cur, "" )).to.equal("123456")
    })

    it('returns a proper header with strings', () => {
        expect(Array.from(csv.rowStringsWithHeader()).reduce( (acc, cur) => `${acc}${acc === "" ? "" : "\n"}${cur}`, "" ))
            .to.equal( stringForm )
        expect(csv.toString()).to.equal(stringForm)
    })

    it('sorts properly', () => {
        csv.sortBy("alpha", false)
        expect(csv.toString()).to.equal(reverseForm)
        csv.sortBy("alpha")
        expect(csv.toString()).to.equal(stringForm)
    })
})