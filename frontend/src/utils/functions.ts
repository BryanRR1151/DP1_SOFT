
const intToDate = (date: number) => {
  let hours = Math.trunc(date / 10000);
  let minutes = "0" + (Math.trunc(date / 100)) % 100;
  let seconds = "0" + date % 100;
  return hours + '/' + minutes.substr(-2) + '/' + seconds.substr(-2);
}

const dateToInt = (date: string) => {
  return Number.parseInt(date.substr(0, 4))*10000 + Number.parseInt(date.substr(5, 2))*100 + Number.parseInt(date.substr(8, 2));
}

export default {
  intToDate,
  dateToInt
}