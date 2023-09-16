const date1 = new Date("2023-06-02T00:00:00.000+00:00");
const date2 = new Date("2023-07-08T00:00:00.000+00:00");
console.log(date2.getMonth());

const diffInMs = date2 - date1;
const numDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));


// // // Get the year and month from the start date
// // const year = startDate.getFullYear();
// // const month = startDate.getMonth();

// // // Calculate the month for the next month
// // const nextMonth = (month + 1) % 12;

// // // Calculate the year for the next month
// // const nextYear = month === 11 ? year + 1 : year;

// // // Create a new date object for the start of the next month
// // const nextMonthStartDate = new Date(nextYear, nextMonth, 1);

// // // Subtract one day from the start of the next month to get the end date of the current month
// // const endDate = new Date(nextMonthStartDate.getTime() - 1);
// // // const next = new Date(endDate.getTime() + 2);
// // // Format the end date as a string
// // // const endDateString = endDate.toISOString();
// // // const numDays = Math.floor((endDate-startDate) / (1000 * 60 * 60 * 24));
// // console.log(nextMonthStartDate); // Output: 2023-12-31T00:00:00.000Z
// // console.log(endDate);
// const currentDate = new Date(startDate);

// // Get the current year and month
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();

// // Calculate the month for the next month
// const nextMonth = (currentMonth + 1) % 12;
// console.log(nextMonth);
// // Calculate the year for the next month
// const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

// // Set the start date of the next month
// const nextMonthStartDate = new Date(nextYear, nextMonth, 1);

// // console.log(nextMonthStartDate.toISOString()); // Output: Start date of the next month in ISO string format
const getLastDateofMonth = (date) => {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const nextMonth = (month + 1) % 12;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonthStartDate = new Date(nextYear, nextMonth, 1);
    const endDate = new Date(nextMonthStartDate.getTime() - 1);
  
    const endDateString = endDate.toISOString().split("T")[0] + "T00:00:00.000+00:00";
    const endDateWithTimezoneOffset = new Date(endDateString);
    const nextDay = new Date(endDateWithTimezoneOffset);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  
  
const startDate = new Date("2024-02-02T00:00:00.000+00:00");
console.log(getLastDateofMonth(startDate));
// Output: 👉 Sat Apr 01 2023 00:00:00 GMT+0530 (India Standard Time)
//   console.log(getStartDateOfNextMonth(startDate));

