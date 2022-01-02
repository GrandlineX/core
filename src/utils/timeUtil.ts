export function timePrint(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function getTimeStamp(): string {
  const date = new Date();
  return `${date.getFullYear()}-${timePrint(date.getMonth() + 1)}-${timePrint(
    date.getDate()
  )} ${timePrint(date.getHours())}:${timePrint(
    date.getMinutes() + 1
  )}:${timePrint(date.getSeconds())}`;
}
