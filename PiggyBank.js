const Store = require("electron-store");

const store = new Store({ name: "piggybanks" });
const schema = {
  foo: {
    type: "number",
    maximum: 100,
    minimum: 1,
    default: 50,
  },
  bar: {
    type: "string",
    format: "url",
  },
};

/**
 * Class of piggy banks
 * A piggy bank has a name, a balance and a list of made transfers.
 */
class PiggyBank {
  /**
   * Initialize this new piggy bank with the given name and balance and an empty list of made transfers.
   * @param {string} name - the name of this new piggy bank
   * @param {number} balance - the balance of this new piggy bank
   */
  constructor(name, balance) {
    this.name = name;
    this.balance = balance;
    this.transfers = [];
    store.set(name + ".balance", balance);
    store.set(name + ".transfers", {});
  }

  /***************************************************
   * NAME
   ***************************************************/
  getName = () => {
    return this.name;
  };

  /***************************************************
   * BALANCE
   ***************************************************/

  /**
   * Set the balance of this piggy bank to the given amount.
   * @param {number} amount - the amount to set the balance to
   */
  setBalance = (amount) => {
    this.balance = amount;
  };

  /**
   * Subtract the given amount from this piggy bank's balance
   * @param {number} amount - the amount to be subtracted from this piggy bank's balance
   */
  subtractFromBalance = (amount) => {
    this.setBalance(this.getBalance() - amount);
  };

  /**
   * Add the given amount to this piggy bank's balance
   * @param {number} amount - the amount to be added to this piggy bank's balance
   */
  addToBalance = (amount) => {
    this.setBalance(this.getBalance() + amount);
  };

  getBalance = () => {
    return this.balance;
  };

  /***************************************************
   * TRANSFERS
   ***************************************************/

  /**
   * Transfer the given amount from this piggy bank to the given receiving piggy bank.
   * @param {PiggyBank} receiverPiggyBank - the receiving piggy bank
   * @param {number} amount - the amount being transferred to the receiving piggy bank
   */
  transferTo = (receiverPiggyBank, amount) => {
    const transfer = new Transfer(this, receiverPiggyBank, amount);
    this.addTransfer(transfer);
    this.subtractFromBalance(amount);
    receiverPiggyBank.addTransfer(transfer);
    receiverPiggyBank.addToBalance(amount);
  };

  /**
   * Add the given transfer to this piggy bank's list of made transfers.
   * @param {Transfer} transfer - the transfer to be added to this piggy bank's list of made transfers
   */
  addTransfer = (transfer) => {
    this.transfers.push(transfer);
  };

  getTransfers = () => {
    return this.transfers;
  };
}
