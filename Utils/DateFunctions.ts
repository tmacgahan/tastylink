export function Timestamp(date: Date): string {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return `${year}-${(month<10) ? "0" : ""}${month}-${(day<10) ? "0":""}${day}`
}

export function TomorrowOf(date: Date): Date {
    let result = new Date();
    result.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    return result;
}

export function TimestampToDate(timestamp: string) {
    let result = new Date();
    result.setFullYear(
        parseInt(timestamp.slice(0,4)),
        parseInt(timestamp.slice(5,7)) - 1,
        parseInt(timestamp.slice(8,10))
    );
    result.setHours(12);
    result.setMinutes(0);
    result.setMilliseconds(0);

    return result;
}

export function TimestampsToDte(queryDate: string, expirationDate: string) {
    return Math.ceil(
          (TimestampToDate(expirationDate).getTime() - TimestampToDate(queryDate).getTime())
        / (1000 * 3600 * 24)
    ); 
}

export function IsWeekday(date: Date): boolean {
    let dayOfWeek = date.getDay();
    return !(dayOfWeek === 0) && !(dayOfWeek === 6);
}

export function IsWeekend(date: Date): boolean {
    return !IsWeekday(date)
}

export function FindFirstDayOfTypeInMonth(date: Date, dayType: number): number {
    let testDate: Date = new Date(date);

    testDate.setDate(1);
    while(testDate.getDay() != dayType) {
        testDate = TomorrowOf(testDate)
    }

    return testDate.getDate();
}

// TODO: Finish checking public holidays
// TODO: compute all the public holidays for the last 20 years, put them in a json somewhere,
// load that into a set, and then just check the set for this shtuff
/*
missing public holidays:
    Martin Luther King Jr. Day: Third Monday in January
    Washington's Birthday: Third Monday in February
    Memorial Day: Last Monday in May

    Thanksgiving:
    it's november: date.getMonth() === 10
    it's thursday: date.getDay() === 4
    it's the third thursday:
        date.getDate() === FindFirstThursdayInMonth(date) + 14
*/
export function IsPublicHoliday(date: Date): boolean {
    if( date.getMonth() === 0 && date.getDate() === 1 ) { // new year's day
        return true;
    } else if( date.getMonth() === 11 && date.getDate() === 25 ) { // christmas
        return true;
    } else if( date.getMonth() === 6 && date.getDate() === 4 ) { // independence day
        return true;
    } else if( date.getMonth() === 10 && date.getDate() === 11 ) { // veteran's day
        return true;
    } else if( date.getMonth() === 5 && date.getDate() === 19 && date.getFullYear() >= 2021 ) { // juneteenth
        return true;
    } else if( date.getMonth() === 10 && date.getDate() === (FindFirstDayOfTypeInMonth(date, 4) + 21) ) { // thanksgiving
        return true;
    } else if( date.getMonth() === 9 && date.getDate() == (FindFirstDayOfTypeInMonth(date, 1) + 7) ) { // columbus day
        return true;
    } else if( date.getMonth() === 8 && date.getDate() == FindFirstDayOfTypeInMonth(date, 1) ) { // labor day
        return true;
    }

    return false;
}

export function IsMarketDay(date: Date): boolean {
    return IsWeekday(date) && !IsPublicHoliday(date);
}

export function NextMarketDay(date: Date): Date {
    let next = TomorrowOf(date)
    while( !IsMarketDay(next) ) {
        next = TomorrowOf(next)
    }

    return next;
}

export function MarketDaysBetween(from: Date, to: Date): Date[] {
    let result: Date[] = new Array<Date>();
    let curr = IsMarketDay(from) ? from : NextMarketDay(from)
    console.log( `starting with ${curr}` );
    while( curr.getTime() <= to.getTime() + 1 ) {
        result.push(curr);
        curr = NextMarketDay(curr);
    }

    return result
}

export function MarketTimestampsBetween(from: string, to: string): string[] {
    return MarketDaysBetween(TimestampToDate(from), TimestampToDate(to)).map(Timestamp)
}
