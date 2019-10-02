const appState = {};

const supportedCards = {
  visa,
  mastercard
};

const countries = [
  {
    code: "US",
    currency: "USD",
    country: "United States"
  },
  {
    code: "NG",
    currency: "NGN",
    country: "Nigeria"
  },
  {
    code: "KE",
    currency: "KES",
    country: "Kenya"
  },
  {
    code: "UG",
    currency: "UGX",
    country: "Uganda"
  },
  {
    code: "RW",
    currency: "RWF",
    country: "Rwanda"
  },
  {
    code: "TZ",
    currency: "TZS",
    country: "Tanzania"
  },
  {
    code: "ZA",
    currency: "ZAR",
    country: "South Africa"
  },
  {
    code: "CM",
    currency: "XAF",
    country: "Cameroon"
  },
  {
    code: "GH",
    currency: "GHS",
    country: "Ghana"
  }
];

const formatAsMoney = (amount, buyerCountry) => {
  const country = countries.filter(data => data.country === buyerCountry);

  const { code, currency } = country[0];

  if (!country) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  } else {
    return amount.toLocaleString(`en-${code}`, { style: "currency", currency });
  }
};

const flagIfInvalid = (field, isValid) => {
  if (isValid) {
    field.classList.remove("is-invalid");
  } else {
    field.classList.add("is-invalid");
  }
};

const expiryDateFormatIsValid = target => {
  const regex = /^\d{2,2}\/\d{2,2}/;

  return regex.test(target);
};

const detectCardType = ({ target }) => {
  const card = document.querySelector("[data-credit-card]");
  const img = document.querySelector("[data-card-type]");

  if (target.value.startsWith("5")) {
    card.classList.add("is-mastercard");
    card.classList.remove("is-visa");
    img.src = supportedCards.mastercard;

    return "is-mastercard";
  } else if (target.value.startsWith("4")) {
    card.classList.add("is-visa");
    card.classList.remove("is-mastercard");
    img.src = supportedCards.visa;

    return "is-visa";
  } else {
    return "not-supported";
  }
};

const validateCardExpiryDate = ({ target }) => {
  const isInTheFuture = () => {
    const dateStr = target.value;
    const dateArr = dateStr.split("/");
    const cardDate = new Date(
      2000 + Number.parseInt(dateArr[1]),
      Number.parseInt(dateArr[0] - 1)
    );
    const today = new Date();

    return cardDate.getTime() > today.getTime();
  };

  if (expiryDateFormatIsValid(target.value) && isInTheFuture()) {
    flagIfInvalid(target, true);
    return true;
  } else {
    flagIfInvalid(target, false);
    return false;
  }
};

const validateCardHolderName = ({ target }) => {
  const validNames = /^[\w]{3,}/;
  const names = target.value.split(" ");

  const [firstName, lastName] = names;

  if (
    validNames.test(firstName) &&
    validNames.test(lastName) &&
    names.length === 2
  ) {
    flagIfInvalid(target, true);
    return true;
  } else {
    flagIfInvalid(target, false);
    return false;
  }
};

const validateWithLuhn = digits => {
  return (
    digits.reduceRight((prev, curr, idx) => {
      prev = parseInt(prev, 10);
      if ((idx + 1) % 2 !== 0) {
        curr = (curr * 2)
          .toString()
          .split("")
          .reduce((p, c) => parseInt(p, 10) + parseInt(c, 10));
      }
      return prev + parseInt(curr, 10);
    }) %
      10 ===
    0
  );
};

const validateCardNumber = () => {
  const cardDigits = document.querySelector("[data-cc-digits]");
  let cardNumber = "";
  const cardInputs = Array.from(cardDigits.querySelectorAll("input"));
  cardInputs.map(({ value }) => {
    if (value.length === 4) {
      return (cardNumber += value);
    }
  });

  const cardArray = [...cardNumber];
  const validCardNum = validateWithLuhn(cardArray);

  if (!validCardNum) {
    cardDigits.classList.add("is-invalid");
    return false;
  } else if (validCardNum) {
    cardDigits.classList.remove("is-invalid");
    return true;
  }
};

const uiCanInteract = () => {
  const ccDigits = document.querySelector("[data-cc-digits]");
  const inputs = ccDigits.querySelectorAll("input");

  inputs[0].addEventListener("blur", detectCardType);

  const info = document.querySelector("[data-cc-info]");
  const infoDetails = info.querySelectorAll("input");

  infoDetails[0].addEventListener("blur", validateCardHolderName);
  infoDetails[1].addEventListener("blur", validateCardExpiryDate);

  document
    .querySelector("[data-pay-btn]")
    .addEventListener("click", validateCardNumber);

  inputs[0].focus();
};

const displayCartTotal = ({ results }) => {
  const [data] = results;
  const { itemsInCart, buyerCountry } = data;

  appState.items = itemsInCart;
  appState.country = buyerCountry;
  appState.bill = itemsInCart.reduce(
    (acc, cur) => acc + cur.price * cur.qty,
    0
  );
  appState.billFormatted = formatAsMoney(appState.bill, appState.country);

  document.querySelector("[data-bill]").textContent = appState.billFormatted;

  uiCanInteract();
};

const fetchBill = () => {
  const api = "https://randomapi.com/api/006b08a801d82d0c9824dcfdfdfa3b3c";

  fetch(api)
    .then(response => response.json())
    .then(data => displayCartTotal(data))
    .catch(err => console.log("Error: ", err));
};

const startApp = () => {
  fetchBill();
};
startApp();
