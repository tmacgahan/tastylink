export function Timestamp(date: Date): string {
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDay();

    return `${year}-${(month<10) ? "0" : ""}${month}-${(day<10) ? "0":""}${day}`
}

export function TomorrowOf(date: Date): Date {
    let result = new Date();
    result.setDate(date.getDate() + 1);
    return result;
}

export function TimestampToDate(timestamp: string) {
    return new Date(
        parseInt(timestamp.slice(0,4)),
        parseInt(timestamp.slice(5,7)),
        parseInt(timestamp.slice(8,10)),
    );
}

export function TimestampsToDte(queryDate: string, expirationDate: string) {
    return Math.ceil(
          (TimestampToDate(expirationDate).getTime() - TimestampToDate(queryDate).getTime())
        / (1000 * 3600 * 24)
    ); 
}

