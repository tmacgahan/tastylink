export function Timestamp(date: Date): string {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();

    return `${year}-${(month<10) ? "0" : ""}${month}-${(day<10) ? "0":""}${day}`
}

export function TomorrowOf(date: Date): Date {
    let result = new Date();
    result.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    return result;
}

export function YesterdayOf(date: Date): Date {
    let result = new Date();
    result.setTime(date.getTime() - (24 * 60 * 60 * 1000));
    return result;
}

export function TimestampToDate(timestamp: string) {
    let result = new Date()
    result.setUTCFullYear(
        parseInt(timestamp.slice(0,4)),
        parseInt(timestamp.slice(5,7)) - 1,
        parseInt(timestamp.slice(8,10))
    );
    result.setUTCHours(12)
    result.setUTCMinutes(0)
    result.setSeconds(0)
    result.setUTCMilliseconds(0)

    return result;
}

export function TimestampsToDte(queryDate: string, expirationDate: string) {
    return Math.ceil(
          (TimestampToDate(expirationDate).getTime() - TimestampToDate(queryDate).getTime())
        / (1000 * 3600 * 24)
    ); 
}

export function IsWeekday(date: Date): boolean {
    let dayOfWeek = date.getUTCDay();
    return !(dayOfWeek === 0) && !(dayOfWeek === 6);
}

export function IsWeekend(date: Date): boolean {
    return !IsWeekday(date)
}

export function FindFirstDayOfTypeInMonth(date: Date, dayType: number): number {
    let testDate: Date = new Date(date);

    testDate.setUTCDate(1);
    while(testDate.getUTCDay() != dayType) {
        testDate = TomorrowOf(testDate)
    }

    return testDate.getUTCDate();
}

export function FindLastDayOfTypeInMonth(date: Date, dayType: number): number {
    let testDate: Date = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);  // last day of the month

    while(testDate.getUTCDay() != dayType) {
        testDate = YesterdayOf(testDate)
    }

    return testDate.getUTCDate();
}

// TODO: compute all the public holidays for the last 20 years, put them in a json somewhere,
// load that into a set, and then just check the set for this shtuff
export function IsPublicHoliday(date: Date): boolean {
    if( date.getUTCMonth() === 0 && date.getUTCDate() === 1 ) { // new year's day
        return true;
    } else if( date.getUTCMonth() === 11 && date.getUTCDate() === 25 ) { // christmas
        return true;
    } else if( date.getUTCMonth() === 6 && date.getUTCDate() === 4 ) { // independence day
        return true;
    }/*else if( date.getUTCMonth() === 10 && date.getUTCDate() === 11 ) { // veteran's day (actually the market is open on veterans day)
        return true;
    }*/else if( date.getUTCMonth() === 5 && date.getUTCDate() === 19 && date.getFullYear() >= 2021 ) { // juneteenth
        return true;
    } else if( date.getUTCMonth() === 10 && date.getUTCDate() === (FindFirstDayOfTypeInMonth(date, 4) + 21) ) { // thanksgiving
        return true;
    } else if( date.getUTCMonth() === 9 && date.getUTCDate() === (FindFirstDayOfTypeInMonth(date, 1) + 7) ) { // columbus day
        return true;
    } else if( date.getUTCMonth() === 8 && date.getUTCDate() === FindFirstDayOfTypeInMonth(date, 1) ) { // labor day
        return true;
    } else if( date.getUTCMonth() === 4 && date.getUTCDate() === FindLastDayOfTypeInMonth(date, 1) ) { // memorial day
        return true;
    } else if( date.getUTCMonth() === 0 && date.getUTCDate() === (FindFirstDayOfTypeInMonth(date, 1) + 14) ) { // MLK day
        return true;
    } else if( date.getUTCMonth() === 1 && date.getUTCDate() === (FindFirstDayOfTypeInMonth(date, 1) + 14) ) { // president's day
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

export function PreviousMarketDay(date: Date): Date {
    let next = YesterdayOf(date)
    while( !IsMarketDay(next) ) {
        next = YesterdayOf(next)
    }

    return next;
}

export function MarketDaysBetween(from: Date, to: Date): Date[] {
    let result: Date[] = new Array<Date>();
    let curr = IsMarketDay(from) ? from : NextMarketDay(from)

    while( curr.getTime() <= to.getTime() + 1 ) {
        result.push(curr);
        curr = NextMarketDay(curr);
    }

    return result
}

export function MarketTimestampsBetween(from: string, to: string): string[] {
    return MarketDaysBetween(TimestampToDate(from), TimestampToDate(to)).map(Timestamp)
}
