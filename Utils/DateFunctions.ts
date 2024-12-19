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

// TODO: Finish checking public holidays
/*
missing public holidays:
    Martin Luther King Jr. Day: Third Monday in January
    Washington's Birthday: Third Monday in February
    Memorial Day: Last Monday in May
    Labor Day: First Monday in September
    Columbus Day: Second Monday in October
    Thanksgiving Day: Fourth Thursday in November
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
