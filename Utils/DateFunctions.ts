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