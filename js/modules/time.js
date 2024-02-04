import { timeOffsetHours } from "./config.js";

export async function NowClientTime() {
  // const date = await axios.get(
  //   "https://api.api-ninjas.com/v1/worldtime?city=London",
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Api-Key": "cf6gEL05KyA4C9H6muenzg==nhfnlZjleBd0LNYe",
  //     },
  //   }
  // );
  const date1 = await axios.get(
    "https://worldtimeapi.org/api/timezone/Europe/London"
  );

  // 2023-10-31T18:29:07.218210+00:00

  // "year": "2023",
  // "month": "09",
  // "day": "09",
  // "hour": "21",
  // "minute": "52",
  // "second": "24",

  // parse string to object with year, month, day, hour, minute, second
  let timeObj = {};
  let timeStr = date1.data.datetime;
  timeObj.year = +timeStr.slice(0, 4);
  timeObj.month = +timeStr.slice(5, 7);
  timeObj.day = +timeStr.slice(8, 10);
  timeObj.hour = +timeStr.slice(11, 13);
  timeObj.minute = +timeStr.slice(14, 16);
  timeObj.second = +timeStr.slice(17, 19);

  let timeHands = createDateMillis(
    +timeObj.year,
    +timeObj.month,
    +timeObj.day,
    +timeObj.hour,
    +timeObj.minute,
    +timeObj.second
  );

  // return timeHands - 120 * 60 * 1000;
  // return timeHands;
  return timeHands - timeOffsetHours * 60 * 60 * 1000;
}

// "year": "2023",
// "month": "09",
// "day": "09",
// "hour": "21",
// "minute": "52",
// "second": "24",
// "day_of_week": "Saturday"

export function createDateMillis(year, month, day, hours, minutes, seconds) {
  // Проверяем, является ли год высокосным
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  // Количество дней в месяцах (включая февраль для высокосных и невысокосных лет)
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  // Проверяем корректность значений месяца и дня
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new Error("Некорректные значения месяца или дня.");
  }

  // Рассчитываем миллисекунды с начала эпохи (1 января 1970 года)
  let milliseconds = 0;

  // Рассчитываем миллисекунды для годов
  for (let y = 1970; y < year; y++) {
    const isLeapYearY = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    milliseconds += isLeapYearY ? 31622400000 : 31536000000; // 31,622,400,000 мс в високосном году, 31,536,000,000 мс в невисокосном
  }

  // Рассчитываем миллисекунды для месяцев
  for (let m = 1; m < month; m++) {
    milliseconds += daysInMonth[m - 1] * 86400000; // 86,400,000 мс в дне
  }

  // Рассчитываем миллисекунды для дней
  milliseconds += (day - 1) * 86400000;

  // Рассчитываем миллисекунды для времени (часы, минуты, секунды)
  milliseconds += hours * 3600000; // 3,600,000 мс в часе
  milliseconds += minutes * 60000; // 60,000 мс в минуте
  milliseconds += seconds * 1000; // 1,000 мс в секунде

  return milliseconds;
}
