"use strict";

//Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance_value");
const labelSumIn = document.querySelector(".summary_value-in");
const labelSumOut = document.querySelector(".summary_value-out");
const labelSumInterest = document.querySelector(".summary_value-interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movement");

const btnLogin = document.querySelector(".login_btn");
const btnTransfer = document.querySelector(".form_btn-transfer");
const btnLoan = document.querySelector(".form_btn-loan");
const btnClose = document.querySelector(".form_btn-close");
const btnSort = document.querySelector(".btn_sort");

const inputLoginUsername = document.querySelector(".login_input-user");
const inputLoginPin = document.querySelector(".login_input-pin");
const inputTransferTo = document.querySelector(".form_input-to");
const inputTransferAmount = document.querySelector(".form_input-amount");
const inputLoanAmount = document.querySelector(".form_input-loan-amount");
const inputCloseUsername = document.querySelector(".form_input-user");
const inputClosePin = document.querySelector(".form_input-pin");

//Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2021-09-01T10:17:24.185Z",
    "2021-09-15T14:11:59.604Z",
    "2021-09-14T17:01:17.194Z",
    "2021-09-20T23:36:17.929Z",
    "2021-09-21T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

let currentAccount, timer;

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

createUsernames(accounts);

//UI
const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const formatMovementsDates = function (date, locale) {
  const daysPassed = calcDaysPassed(date, new Date());

  if (daysPassed === 0) return "Today";

  if (daysPassed === 1) return "Yesterday";

  if (daysPassed <= 7) return `${daysPassed} days ago`;

  //Else
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i, array) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDates(date, acc.locale);

    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
       <div class="movement_row">
          <div class="movement_type movement_type-${type}">${
      i + 1
    } ${type}</div>
          <div class="movement_date">${displayDate}</div>
          <div class="movement_value">${formattedMov}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calculateBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  const formattedBal = formatCurrency(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formattedBal}`;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(income, acc.locale, acc.currency);

  const outcome = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(outcome),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => deposit * (acc.interestRate / 100))
    .filter((int) => int > 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const updateUI = function (acc) {
  //Display movements
  displayMovement(acc);

  //Display balance
  calculateBalance(acc);

  //Display Summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = () => {
  //Set time to 5min
  let time = 300;

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //display the time in the UI
    labelTimer.textContent = `${min}:${sec}`;

    //When sec is 0 stop timer and log out the user
    if (time === 0) {
      clearInterval(timer);
      containerApp.classList.remove("active");
      labelWelcome.textContent = "Log in to get started";
    }

    //Decrease the time every seconds
    time--;
  };

  //Call the timer every seconds
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//Login
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and message
    containerApp.classList.add("active");
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    //Display date
    const now = new Date();

    const locale = currentAccount.locale;

    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    //start Timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    //Update the UI
    updateUI(currentAccount);
  }
});

//Transfer
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const recieverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    recieverAcc &&
    currentAccount.balance >= amount &&
    recieverAcc.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);

    //add new date
    currentAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());

    //Update the UI
    updateUI(currentAccount);

    //Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

//Request Loan
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      //Add amount to current acc movement
      currentAccount.movements.push(amount);

      //add new date
      currentAccount.movementsDates.push(new Date().toISOString());

      //Update the UI
      updateUI(currentAccount);

      //Reset the timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 3000);
  }
  inputLoanAmount.value = "";
});

//Delete Account
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    //Delete account
    accounts.splice(index, 1);

    //Remove UI
    containerApp.classList.remove("active");
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let isSorted = false;

//Sort
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovement(currentAccount, !isSorted);
  isSorted = !isSorted;
});
