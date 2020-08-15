/**
 * HANDLE NAME CHANGE BUTTON CLICK
 */

const handleChangeNameButton = (e) => {
  e.preventDefault();
  const popupform = document.querySelector(`.changename__popupform`);
  popupform.style.display = "block";

  window.onclick = function (event) {
    if (event.target == popupform) {
      popupform.style.display = "none";
    }
  };

  popupform.querySelector(`.changename__popupform--name`).focus();

  const changename = document.querySelector(`.changename__popupform`);
  changename.addEventListener("submit", handleChangeName);
};

/**
 * HANDLE NAME CHANGE
 */

const handleChangeName = (e) => {
  e.preventDefault();
  const popupform = e.currentTarget;
  const name = popupform.querySelector(`.changename__popupform--name`).value;
  db.run("UPDATE Piggybanks SET Name = $name WHERE Id = $id", {
    $name: name,
    $id: id,
  });

  popupform.querySelector(`.changename__popupform--name`).value = "";

  popupform.style.display = "none";
  updateBalance();
};

/**
 * DETECT CLICK IN TRANSACTION LIST AND UPDATE THE SUMMARY
 */

const handleTransactionClick = (e) => {
  console.log("got here");
  previous = e.currentTarget.parentElement.querySelector("li.selected");
  if (previous) previous.classList.remove("selected");
  e.currentTarget.classList.add("selected");
  const id = e.currentTarget.getAttribute("id");

  db.get(
    "SELECT sender.Name AS SenderName, receiver.Name AS ReceiverName, Amount, Date, Message FROM Transactions LEFT JOIN Piggybanks sender ON Transactions.SenderId = sender.Id LEFT JOIN Piggybanks receiver ON Transactions.ReceiverId = receiver.Id WHERE Transactions.Id = $id ORDER BY Date DESC",
    {
      $id: id,
    },
    (err, row) => {
      extraInfo = document.querySelector(`.extrainfo__container`);
      const date = moment.unix(row.Date).format("DD-MM-YYYY");
      if (row.SenderName == null) row.SenderName = "---";
      if (row.ReceiverName == null) row.ReceiverName = "---";

      extraInfo.innerHTML = `<div class="summary">
                            <p class="summary__date--field">${date}</p>
                            <div class="summary__sender">
                                <p class="summary__sender--header">Sender:</p>
                                <p class="summary__sender--field">${
                                  row.SenderName
                                }</p>
                            </div>
                            <div class="summary__recipient">
                                <p class="summary__recipient--header">Recipient:</p>
                                <p class="summary__recipient--field">${
                                  row.ReceiverName
                                }</p>
                            </div>
                            <img class="summary__arrow" src="assets/images/detail-page/arrow.png" />
                            <p class="summary__amount">${row.Amount.toFixed(
                              2
                            )}</p>
                            <div class="summary__message">
                                <p class="summary__message--header">Message:</p>
                                <p class="summary__message--field">${
                                  row.Message
                                }</p>
                            </div>
                        </div>`;
    }
  );
};

/**
 * UPDATE THE BALANCE IN THE TOP LEFT CORNER
 */

const updateBalance = () => {
  db.get(
    "SELECT Name, Balance FROM Piggybanks WHERE Id = $id AND Active = 1",
    {
      $id: id,
    },
    (err, row) => {
      document.querySelector(
        `.balance`
      ).innerHTML = `<p class="balance__text">${
        row.Name
      } <span class="colon">: </span></p>
          <p class="balance__balance">${row.Balance.toFixed(2)}</p>`;
    }
  );
};

/**
 * QUERY AND SHOW THE TRANSACTIONS IN THE HTML
 */

const updateScreen = async () => {
  updateBalance();

  let transactionList = "";
  db.each(
    "SELECT Transactions.Id AS Id, SenderId, ReceiverId, sender.Name AS SenderName, receiver.Name AS ReceiverName, Amount, Date FROM Transactions LEFT JOIN Piggybanks sender ON Transactions.SenderId = sender.Id LEFT JOIN Piggybanks receiver ON Transactions.ReceiverId = receiver.Id WHERE (SenderId = $id OR ReceiverId = $id) ORDER BY Date DESC",
    {
      $id: id,
    },
    (err, row) => {
      transactionList += `<li class="piggybank__transactions--transaction", id="${row.Id}">`;
      if (row.SenderId == id) {
        transactionList += `<p>- ${row.Amount.toFixed(2)}</p>`;
        if (row.ReceiverId !== null) {
          transactionList += `<p class="piggybank__transactions--transaction__source">to ${row.ReceiverName}</p>`;
        }
      } else if (row.ReceiverId == id) {
        transactionList += `<p>+ ${row.Amount.toFixed(2)}</p>`;
        if (row.SenderId !== null) {
          transactionList += `<p class="piggybank__transactions--transaction__source">from ${row.SenderName}</p>`;
        }
      }
      const date = moment.unix(row.Date).format("DD-MM-YYYY");
      transactionList += `<p>${date}</p></li>`;
    },
    (transactionErr, transactionRow) => {
      const transactionListElement = document.querySelector(
        `.piggybank__transactions`
      );
      transactionListElement.innerHTML = transactionList;

      transactionElements = document.querySelectorAll(
        `.piggybank__transactions--transaction`
      );
      transactionElements.forEach((transactionElement) => {
        transactionElement.addEventListener("click", handleTransactionClick);
      });
    }
  );
};

const init = () => {
  updateScreen();

  const changeNameButton = document.querySelector(`.changename__button`);
  changeNameButton.addEventListener("submit", handleChangeNameButton);
};

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
var db = new sqlite3.Database("Piggybanks.db");

init();
