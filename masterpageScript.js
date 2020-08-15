/**
 * EXTEND TRANSACTION LIST UPON HOVER
 */

const handlePiggyBankHover = (e) => {
  const piggyBank = e.currentTarget;
  const transactionList = piggyBank.parentElement.querySelector(
    `.piggybank__transactions`
  );
  transactionList.style.transform = "translateY(0rem)";
};

const handlePiggyBankUnhover = (e) => {
  const piggyBank = e.currentTarget;
  const transactionList = piggyBank.parentElement.querySelector(
    `.piggybank__transactions`
  );
  const yDist = -transactionList.offsetHeight - 5;
  transactionList.style.transform = `translateY(${yDist}px)`;
};

/**
 * SCROLL THROUGHT PIGGY BANKS UPON SCROLL
 */

const handlePiggyBankScroll = (e) => {
  if (e.deltaY > 0) e.currentTarget.scrollLeft += 20;
  else e.currentTarget.scrollLeft -= 20;
  console.log(e.currentTarget.scrollLeft);
};

/**
 * OPEN PIGGY BANK DETAILS UPON CLICK
 */

const handlePiggyBankClick = (e) => {
  id = e.currentTarget.parentElement.parentElement.getAttribute("id");
  electron.remote
    .getCurrentWindow()
    .loadURL(
      `file://${electron.remote.app.getAppPath()}/detailWindow.html?id=${id}`
    );
};

/**
 * HANLDE DEPOSIT BUTTON PRESS
 */
const handleDepositButton = (e) => {
  e.preventDefault();
  const popupform = document.querySelector(`.deposit__popupform`);
  popupform.style.display = "block";

  window.onclick = function (event) {
    if (event.target == popupform) {
      popupform.style.display = "none";
    }
  };

  const popupformId = popupform.querySelector(
    `.deposit__popupform--receiverId`
  );
  popupformId.value = e.currentTarget.parentElement.parentElement.getAttribute(
    "id"
  );

  popupform.querySelector(`.deposit__popupform--amount`).focus();

  const deposit = document.querySelector(`.deposit__popupform`);
  deposit.addEventListener("submit", handleDeposit);
};

/**
 * ADD MONEY TO THE PIGGY BANK BALANCE
 */

const handleDeposit = (e) => {
  e.preventDefault();
  const id = e.currentTarget.querySelector(`.deposit__popupform--receiverId`)
    .value;
  const amount = e.currentTarget.querySelector(`.deposit__popupform--amount`)
    .value;
  const message = e.currentTarget.querySelector(`.deposit__popupform--message`)
    .value;

  if (amount > 0) {
    db.run("UPDATE Piggybanks SET Balance = Balance + $amount WHERE Id = $id", {
      $id: id,
      $amount: amount,
    });

    db.run(
      "INSERT INTO Transactions VALUES (NULL, NULL, $id, $amount, $message, strftime('%s','now'))",
      {
        $id: id,
        $amount: amount,
        $message: message,
      }
    );

    e.currentTarget.parentElement.querySelector(
      `.deposit__popupform--amount`
    ).value = "";

    const popupform = document.querySelector(`.deposit__popupform`);
    popupform.style.display = "none";
    updateScreen();
  }
};

/**
 * HANDLE WITHDRAW BUTTON PRESS
 */
const handleWithdrawButton = (e) => {
  e.preventDefault();
  const popupform = document.querySelector(`.withdraw__popupform`);
  popupform.style.display = "block";

  window.onclick = function (event) {
    if (event.target == popupform) {
      popupform.style.display = "none";
    }
  };

  const popupformId = popupform.querySelector(`.withdraw__popupform--senderId`);
  popupformId.value = e.currentTarget.parentElement.parentElement.getAttribute(
    "id"
  );

  popupform.querySelector(`.withdraw__popupform--amount`).focus();

  const withdraw = document.querySelector(`.withdraw__popupform`);
  withdraw.addEventListener("submit", handleWithdraw);
};

/**
 * SUBTRACT MONEY FROM THE PIGGY BANK BALANCE
 */

const handleWithdraw = (e) => {
  e.preventDefault();
  const id = e.currentTarget.querySelector(`.withdraw__popupform--senderId`)
    .value;
  const amount = e.currentTarget.querySelector(`.withdraw__popupform--amount`)
    .value;
  const message = e.currentTarget.querySelector(`.withdraw__popupform--message`)
    .value;

  if (amount > 0) {
    db.run("UPDATE Piggybanks SET Balance = Balance - $amount WHERE Id = $id", {
      $id: id,
      $amount: amount,
    });

    db.run(
      "INSERT INTO Transactions VALUES (NULL, $id, NULL, $amount, $message, strftime('%s','now'))",
      {
        $id: id,
        $amount: amount,
        $message: message,
      }
    );

    e.currentTarget.parentElement.querySelector(
      `.withdraw__popupform--amount`
    ).value = "";

    const popupform = document.querySelector(`.withdraw__popupform`);
    popupform.style.display = "none";
    updateScreen();
  }
};

/**
 * HANDLE TRANSFER BUTTON PRESS
 */

const handleTransferButton = (e) => {
  e.preventDefault();
  const popupform = document.querySelector(`.transfer__popupform`);
  popupform.style.display = "block";

  let nameOptions = "";

  db.all("SELECT Id, Name FROM Piggybanks WHERE Active = 1", (err, rows) => {
    for (const row of rows) {
      nameOptions += `<option value="` + row.Id + `">` + row.Name + `</option>`;
    }

    const sender = popupform.querySelector(`.transfer__popupform--sender`);
    const receiver = popupform.querySelector(`.transfer__popupform--receiver`);
    sender.innerHTML = nameOptions;
    receiver.innerHTML = nameOptions;

    window.onclick = function (event) {
      if (event.target == popupform) {
        popupform.style.display = "none";
      }
    };

    popupform.querySelector(`.transfer__popupform--sender`).focus();

    const addPiggyBank = document.querySelector(`.transfer__popupform`);
    addPiggyBank.addEventListener("submit", handleTransfer);
  });
};

/**
 * HANDLE TRANSFER BETWEEN PIGGY BANKS
 */

const handleTransfer = (e) => {
  e.preventDefault();
  const popupform = e.currentTarget;
  const sender = popupform.querySelector(`.transfer__popupform--sender`);
  const senderId = sender.options[sender.selectedIndex].value;
  const receiver = popupform.querySelector(`.transfer__popupform--receiver`);
  const receiverId = receiver.options[receiver.selectedIndex].value;
  const amount = popupform.querySelector(`.transfer__popupform--amount`).value;
  const message = popupform.querySelector(`.transfer__popupform--message`)
    .value;

  if (senderId !== receiverId && amount > 0) {
    db.run(
      "UPDATE Piggybanks SET Balance = Balance - $amount WHERE Id = $senderId",
      {
        $senderId: senderId,
        $amount: amount,
      }
    );

    db.run(
      "UPDATE Piggybanks SET Balance = Balance + $amount WHERE Id = $receiverId",
      {
        $receiverId: receiverId,
        $amount: amount,
      }
    );

    db.run(
      "INSERT INTO Transactions VALUES (NULL, $senderId, $receiverId, $amount, $message, strftime('%s','now'))",
      {
        $senderId: senderId,
        $receiverId: receiverId,
        $amount: amount,
        $message: message,
      }
    );

    popupform.querySelector(`.transfer__popupform--amount`).value = "";
    popupform.style.display = "none";
    updateScreen();
  }
};

/**
 * HANDLE ADD PIGGY BANK BUTTON PRESS
 */
const handleAddPiggyBankButton = (e) => {
  e.preventDefault();
  const popupform = document.querySelector(`.addpiggybank__popupform`);
  popupform.style.display = "block";

  window.onclick = function (event) {
    if (event.target == popupform) {
      popupform.style.display = "none";
    }
  };

  popupform.querySelector(`.addpiggybank__popupform--name`).focus();

  const addPiggyBank = document.querySelector(`.addpiggybank__popupform`);
  addPiggyBank.addEventListener("submit", handleAddPiggyBank);
};

/**
 * ADD PIGGY BANK TO THE DATABASE
 */

const handleAddPiggyBank = async (e) => {
  e.preventDefault();
  const popupform = e.currentTarget;
  let id = NaN;
  const name = popupform.querySelector(`.addpiggybank__popupform--name`).value;
  let balance = popupform.querySelector(`.addpiggybank__popupform--balance`)
    .value;
  if (balance == null || balance == "") {
    balance = 0;
  }

  await new Promise((resolve) => {
    db.run(
      "INSERT INTO Piggybanks VALUES (NULL, $name, $balance, 1)",
      {
        $name: name,
        $balance: balance,
      },
      function (err) {
        id = this.lastID;
        resolve();
      }
    );
  });
  if (balance > 0) {
    db.run(
      "INSERT INTO Transactions VALUES (NULL, NULL, $id, $amount, $message, strftime('%s','now'))",
      {
        $id: id,
        $amount: balance,
        $message: "Initial balance",
      }
    );
  } else if (balance < 0) {
    db.run(
      "INSERT INTO Transactions VALUES (NULL, $id, NULL, $amount, $message, strftime('%s','now'))",
      {
        $id: id,
        $amount: -balance,
        $message: "Initial balance",
      }
    );
  }

  popupform.querySelector(`.addpiggybank__popupform--name`).value = "";
  popupform.querySelector(`.addpiggybank__popupform--balance`).value = "";

  popupform.style.display = "none";
  updateScreen();
};

/**
 * REMOVE PIGGY BANK FROM THE DATABASE
 */
// investigate Element.remove() to delete piggy banks

const handleRemove = (e) => {
  e.preventDefault();
  const id = e.currentTarget.parentElement.parentElement.getAttribute("id");
  db.run("UPDATE Piggybanks SET Active = 0 WHERE Id = $id", {
    $id: id,
  });
  updateScreen();
};

/**
 * READ PIGGY BANK DATA FROM DATABASE FILE AND UPDATE RENDERER
 */
// investigate Element.remove() to delete piggy banks
const updateScreen = () => {
  let totalBalance = 0;
  let html = "";

  db.all(
    "SELECT Id, Name, Balance FROM Piggybanks WHERE Active = 1",
    async (err, piggybankRows) => {
      for (const piggybankRow of piggybankRows) {
        await new Promise((resolve) => {
          let transactionList = "";
          db.each(
            "SELECT SenderId, ReceiverId, sender.Name AS SenderName, receiver.Name AS ReceiverName, Amount FROM Transactions LEFT JOIN Piggybanks sender ON Transactions.SenderId = sender.Id LEFT JOIN Piggybanks receiver ON Transactions.ReceiverId = receiver.Id WHERE (SenderId = $id OR ReceiverId = $id) ORDER BY Date DESC LIMIT 5",
            {
              $id: piggybankRow.Id,
            },
            (transactionErr, transactionRow) => {
              transactionList +=
                '<li class="piggybank__transactions--transaction">';
              if (transactionRow.SenderId == piggybankRow.Id) {
                transactionList += "- " + transactionRow.Amount.toFixed(2);
                if (transactionRow.ReceiverId !== null) {
                  transactionList +=
                    '<span class="piggybank__transactions--transaction__extra"> to ' +
                    transactionRow.ReceiverName +
                    "</span></li>";
                }
              } else if (transactionRow.ReceiverId == piggybankRow.Id) {
                transactionList += "+ " + transactionRow.Amount.toFixed(2);
                if (transactionRow.SenderId !== null) {
                  transactionList +=
                    '<span class="piggybank__transactions--transaction__extra"> from ' +
                    transactionRow.SenderName +
                    "</span></li>";
                }
              }
            },
            (transactionErr, transactionRow) => {
              totalBalance += piggybankRow.Balance;
              html +=
                `<section class="piggybank" id="` +
                piggybankRow.Id +
                `">
                <div class="piggybank__bank">
                  <img  class="piggybank__bank--image"
                  src="./assets/images/master-page/piggy bank.png"
                  height="300"
                  />
                <form class="piggybank__bank--depositbutton">
                  <input type="image" src="./assets/images/master-page/depositbutton.png" />
                </form>
                <form class="piggybank__bank--withdrawbutton">
                  <input type="image" src="./assets/images/master-page/withdrawbutton.png" />
                </form>
                <p class="piggybank__bank--name">` +
                piggybankRow.Name +
                `</p>
                <form class="piggybank__bank--removebutton">
                  <input type="image" src="./assets/images/master-page/removebutton.png" />
                </form>
              </div>                
              <div class="piggybank__transactions--container">
                <ul class="piggybank__transactions">` +
                transactionList +
                `</ul>
              </div>
              <p class="piggybank__balance">` +
                piggybankRow.Balance.toFixed(2) +
                `</p>
            </section>`;
              resolve();
            }
          );
        });
      }

      const piggyBanks = document.querySelector(`.piggybanks`);
      piggyBanks.innerHTML = html;
      if (piggyBanks.scrollWidth <= piggyBanks.clientWidth) {
        piggyBanks.style.justifyContent = "center";
      } else if (piggyBanks.scrollWidth > piggyBanks.clientWidth) {
        piggyBanks.style.justifyContent = "flex-start";
        piggyBanks.scrollLeft =
          (piggyBanks.scrollWidth - piggyBanks.clientWidth) / 2;
      }
      const bankNoteBalance = document.querySelector(`.totalbanknote__balance`);
      bankNoteBalance.textContent = totalBalance.toFixed(2);

      const piggyBankList = document.querySelectorAll(`.piggybank`);
      piggyBankList.forEach((piggyBank) => {
        piggyBankImage = piggyBank.querySelector(`.piggybank__bank--image`);
        piggyBankBank = piggyBank.querySelector(`.piggybank__bank`);
        piggyBankTransactions = piggyBank.querySelector(
          `.piggybank__transactions`
        );
        piggyBankImage.addEventListener("click", handlePiggyBankClick);
        piggyBankBank.addEventListener("mouseenter", handlePiggyBankHover);
        piggyBankTransactions.addEventListener(
          "mouseenter",
          handlePiggyBankHover
        );
        piggyBankBank.addEventListener("mouseleave", handlePiggyBankUnhover);
        piggyBankTransactions.addEventListener(
          "mouseleave",
          handlePiggyBankUnhover
        );

        const depositButton = piggyBankBank.querySelector(
          `.piggybank__bank--depositbutton`
        );
        depositButton.addEventListener("submit", handleDepositButton);

        const withdrawButton = piggyBankBank.querySelector(
          `.piggybank__bank--withdrawbutton`
        );
        withdrawButton.addEventListener("submit", handleWithdrawButton);

        const removeButton = piggyBankBank.querySelector(
          `.piggybank__bank--removebutton`
        );
        removeButton.addEventListener("submit", handleRemove);
      });
    }
  );
};

const init = () => {
  updateScreen();

  const addPiggyBankButton = document.querySelector(`.addpiggybank__button`);
  addPiggyBankButton.addEventListener("submit", handleAddPiggyBankButton);

  const transferButton = document.querySelector(`.transfer__button`);
  transferButton.addEventListener("submit", handleTransferButton);

  const piggyBanksContainer = document.querySelector(`.piggybanks`);
  piggyBanksContainer.addEventListener("wheel", handlePiggyBankScroll);
};

var db = new sqlite3.Database("Piggybanks.db");

init();
