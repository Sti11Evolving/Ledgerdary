const sqlite3 = require(`sqlite3`);
const fs = require("fs");
const { PermissionsBitField } = require("discord.js");

function errorHandler(successMessage) {
  return (err) => {
    if (err) console.error(err);
    else if (successMessage) console.info(successMessage);
  };
}

async function getLedger(guild, db_ = undefined) {
  var endOperation = false;
  if (db_) {
    return { endOperation: endOperation, db: db_ };
  } else {
    endOperation = true;
    if (!fs.existsSync(`./ledgers/${guild.id}.db`))
      await module.exports.newLedger(guild);

    return {
      endOperation: endOperation,
      db: new sqlite3.Database(`./ledgers/${guild.id}.db`, errorHandler()),
    };
  }
}

function isNumeric(n) {
  return typeof n == "number" && !isNaN(n);
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// Gets rid of all fields in an object that are 0
function trimZeros(obj) {
  for (const field in obj) if (obj[field] == 0) delete obj[field];
  return !isEmpty(obj) != 0 ? obj : undefined;
}

function trimZerosNested(obj) {
  for (const field in obj) {
    obj[field] = trimZeros(obj[field]);
    if (obj[field] == undefined) delete obj[field];
  }
  return !isEmpty(obj) != 0 ? obj : undefined;
}

function isAdmin(member) {
  return member.permissions.has(
    new PermissionsBitField(PermissionsBitField.Flags.Administrator)
  )
    ? true
    : false;
}

module.exports = {
  async newLedger(guild) {
    const db = new sqlite3.Database(
      `./ledgers/${guild.id}.db`,
      errorHandler(),
      sqlite3.OPEN_CREATE
    );

    const createTablesQuery = `
    CREATE TABLE currencies
    (
      [id] INTEGER PRIMARY KEY AUTOINCREMENT,
      [name] TEXT NOT NULL UNIQUE,
      [symbol] TEXT NOT NULL UNIQUE,
      [is_default] BOOLEAN NOT NULL CHECK (is_default IN (0, 1)),
      [use_prefix] BOOLEAN NOT NULL CHECK (use_prefix IN (0, 1)),
      [has_space] BOOLEAN NOT NULL CHECK (has_space IN (0, 1)),
      [has_plural] BOOLEAN NOT NULL CHECK (has_plural IN (0, 1))
    );

    CREATE TABLE transactions
    (
      [id] INTEGER PRIMARY KEY AUTOINCREMENT,
      [interaction_id] text NOT NULL,
      [buyer_borrower_id] text NOT NULL,
      [seller_lender_id] text NOT NULL,
      [currency_id] INTEGER NOT NULL REFERENCES currencies(id),
      [amount] REAL NOT NULL,
      [time_offered] INTEGER NOT NULL,
      [time_accepted] INTEGER,
      [is_loan] BOOLEAN NOT NULL CHECK (is_loan IN (0, 1)),
      [is_pending] BOOLEAN NOT NULL CHECK (is_pending IN (0, 1)),
      [reason] text
    );`;

    db.exec(createTablesQuery, errorHandler());
    db.close();
  },

  async deleteLedger(guild) {
    fs.unlink(`./ledgers/${guild.id}.db`, errorHandler());
  },

  async ledgerExists(guild) {
    return fs.existsSync(`./ledgers/${guild.id}.db`);
  },

  async newCurrency(
    guild,
    name,
    symbol,
    is_default,
    use_prefix,
    has_space,
    has_plural,
    db_ = undefined
  ) {
    // account for unrequired arguments
    if (!symbol) {
      symbol = name;
    }
    if (symbol.length == 1) {
      use_prefix = use_prefix ? use_prefix : true;
      has_space = has_space ? has_space : false;
      has_plural = has_plural ? has_plural : false;
    } else {
      use_prefix = use_prefix ? use_prefix : false;
      has_space = has_space ? has_space : true;
      has_plural = has_plural ? has_plural : true;
    }

    const { endOperation, db } = getLedger(guild, db_);

    if (await module.exports.currenciesIsEmpty(guild, db)) {
      is_default = true;
    } else if (is_default == undefined) {
      is_default = false;
    } else if (is_default) {
      const defaultCurrency = await module.exports.getDefaultCurrency(guild);
      await module.exports.editCurrency(
        guild,
        defaultCurrency.id,
        defaultCurrency.name,
        defaultCurrency.symbol,
        false,
        defaultCurrency.use_prefix,
        defaultCurrency.has_space,
        defaultCurrency.has_plural,
        db
      );
    }

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO currencies 
        (name, symbol, is_default, use_prefix, has_space, has_plural) 
        VALUES ($name, $symbol, $is_default, $use_prefix, $has_space, $has_plural)`,
        {
          $name: name,
          $symbol: symbol,
          $is_default: is_default,
          $use_prefix: use_prefix,
          $has_space: has_space,
          $has_plural: has_plural,
        },
        (error) => {
          if (error) reject(error);
          resolve();
        }
      );

      if (endOperation) db.close();
    });
  },

  async editCurrency(
    guild,
    currency_id,
    name,
    symbol,
    is_default,
    use_prefix,
    has_space,
    has_plural,
    db_ = undefined
  ) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE currencies SET name = $name, symbol = $symbol, is_default = $is_default, use_prefix = $use_prefix, has_space = $has_space, has_plural = $has_plural
        WHERE id = $id`,
        {
          $id: currency_id,
          $name: name,
          $symbol: symbol,
          $is_default: is_default,
          $use_prefix: use_prefix,
          $has_space: has_space,
          $has_plural: has_plural,
        },
        (err) => {
          if (err) reject(err);
          return resolve();
        }
      );
      if (endOperation) db.close();
    });
  },

  async editCurrencyDefault(guild, currency_id, is_default, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE currencies SET is_default = $is_default
        WHERE id = $id`,
        {
          $is_default: is_default,
          $id: currency_id,
        },
        (err) => {
          if (err) reject(err);
          return resolve();
        }
      );
      if (endOperation) db.close();
    });
  },

  async currenciesIsEmpty(guild, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT NOT EXISTS(SELECT 1 FROM currencies) as is_empty;`,
        (err, out) => {
          if (err) reject(err);
          return resolve(out.is_empty);
        }
      );
      if (endOperation) db.close();
    });
  },

  async deleteCurrency(guild, currency_id, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM currencies
        WHERE id = $id`,
        {
          $id: currency_id,
        },
        (err) => {
          if (err) reject(err);
          return resolve();
        }
      );

      db.run(
        `DELETE FROM transactions
        WHERE currency_id = $currency_id`,
        {
          $currency_id: currency_id,
        },
        (err) => {
          if (err) reject(err);
          return resolve();
        }
      );
      if (endOperation) db.close();
    });
  },

  async getCurrencies(guild, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM currencies", (error, currencies) => {
        if (error) reject(error);
        return resolve(currencies);
      });
      if (endOperation) db.close();
    });
  },

  async getCurrency(guild, name_id, db_ = undefined) {
    if (name_id == undefined) {
      return module.exports.getDefaultCurrency(guild, db_);
    }
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      // If name_id is a number, retrieve by id
      if (isNumeric(name_id)) {
        db.get(
          `SELECT * FROM currencies WHERE id = "${name_id}"`,
          (error, currency) => {
            if (error) reject(error);
            return resolve(currency);
          }
        );
      } else {
        // Otherwise retrive by name
        db.get(
          `SELECT * FROM currencies WHERE upper(name) = "${name_id.toUpperCase()}"`,
          (error, currency) => {
            if (error) reject(error);
            if (currency != undefined) return resolve(currency);
            // If you can't find it by name, try to search by symbol
            db.get(
              `SELECT * FROM currencies WHERE upper(symbol) = "${name_id.toUpperCase()}"`,
              (error, currency) => {
                if (error) reject(error);
                return resolve(currency);
              }
            );
          }
        );
      }
      if (endOperation) db.close();
    });
  },

  async getDefaultCurrency(guild, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM currencies WHERE is_default = 1`,
        (error, currency) => {
          if (error) reject(error);
          return resolve(currency);
        }
      );
      if (endOperation) db.close();
    });
  },

  async currencyAmountToString(currency, amount) {
    sign = Math.sign(amount) == -1 ? "-" : "";
    let string = Math.abs(amount).toString();
    var symbol =
      currency.has_plural && amount != 1
        ? currency.symbol + "s"
        : currency.symbol;
    if (currency.use_prefix) {
      string = currency.has_space ? symbol + " " + string : symbol + string;
    } else {
      string = currency.has_space ? string + " " + symbol : string + symbol;
    }
    return sign + string;
  },

  async pendTransaction(
    guild,
    interaction_id,
    buyer_borrower_id,
    seller_lender_id,
    currency_id,
    amount,
    timestamp,
    is_loan,
    reason,
    db_ = undefined
  ) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO transactions (interaction_id, buyer_borrower_id, seller_lender_id, currency_id, amount, time_offered, is_loan, is_pending, reason) 
         VALUES ($interaction_id, $buyer_borrower_id, $seller_lender_id, $currency_id, $amount, $time_offered, $is_loan, $is_pending, $reason)`,
        {
          $interaction_id: interaction_id,
          $buyer_borrower_id: buyer_borrower_id,
          $seller_lender_id: seller_lender_id,
          $currency_id: currency_id,
          $amount: amount,
          $time_offered: timestamp,
          $is_loan: is_loan,
          $is_pending: 1,
          $reason: reason,
        },
        (error) => {
          if (error) reject(error);
          return resolve();
        }
      );
      if (endOperation) db.close();
    });
  },

  async resolvePendingTransaction(guild, interaction_id, db_ = undefined) {
    timestamp = Date.now();
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE transactions SET is_pending = 0, time_accepted = $time WHERE interaction_id = $interaction_id",
        { $interaction_id: interaction_id, $time: timestamp },
        (error) => {
          if (error) reject(error);
        }
      );
      if (endOperation) db.close();
      resolve();
    });
  },

  async removeTransactions(guild, interaction_id, db_ = undefined) {
    const { endOperation, db } = getLedger(guild, db_);
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM transactions WHERE interaction_id = $interaction_id",
        { $interaction_id: interaction_id },
        (error) => {
          if (error) reject(error);
        }
      );
      if (endOperation) db.close();
      resolve();
    });
  },

  async canAcceptTransaction(interaction) {
    const member = interaction.member;
    if (isAdmin(member)) return true;

    const offeringUser = interaction.message.interaction.user;
    if (member.id == offeringUser.id) return false;

    const { db } = getLedger(interaction.guild, undefined);
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT buyer_borrower_id, seller_lender_id FROM transactions WHERE interaction_id = $interaction_id",
        { $interaction_id: interaction.message.interaction.id },
        (error, transaction) => {
          if (error) reject(error);
          resolve(
            member.id == transaction.buyer_borrower_id ||
              member.id == transaction.seller_lender_id
              ? true
              : false
          );
        }
      );
      db.close();
    });
  },

  async canDeclineTransaction(interaction) {
    const member = interaction.member;
    if (isAdmin(member)) return true;

    const offeringUser = interaction.message.interaction.user;
    if (member.id == offeringUser.id) return true;

    const { db } = getLedger(interaction.guild, undefined);
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT buyer_borrower_id, seller_lender_id FROM transactions WHERE interaction_id = $interaction_id",
        { $interaction_id: interaction.message.interaction.id },
        (error, transaction) => {
          if (error) reject(error);
          resolve(
            member.id == transaction.buyer_borrower_id ||
              member.id == transaction.seller_lender_id
              ? true
              : false
          );
        }
      );
      db.close();
    });
  },

  async getBalanceTarget(interaction, target_id, db_ = undefined) {
    user = interaction.user;
    const { endOperation, db } = getLedger(interaction.guild, db_);
    var balances = {};
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT name, amount, buyer_borrower_id 
        FROM transactions
        INNER JOIN currencies
        ON transactions.currency_id = currencies.id
        WHERE is_pending = 0 AND ((buyer_borrower_id = $user AND seller_lender_id = $target) OR (buyer_borrower_id = $target AND seller_lender_id = $user))`,
        {
          $user: user.id,
          $target: target_id,
        },
        (error, transactions) => {
          if (error) reject(error);
          if (!transactions.length) resolve(undefined);
          for (const transaction of transactions) {
            if (balances[transaction.name] === undefined)
              balances[transaction.name] = 0;

            balances[transaction.name] +=
              transaction.buyer_borrower_id == user.id
                ? transaction.amount
                : -1 * transaction.amount;
          }

          resolve(trimZeros(balances));
        }
      );
      if (endOperation) db.close();
    });
  },

  async getDebtsTarget(interaction, target_id, db_ = undefined) {
    user = interaction.user;
    const { endOperation, db } = getLedger(interaction.guild, db_);
    var debts = {};
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT name, amount, buyer_borrower_id 
        FROM transactions
        INNER JOIN currencies
        ON transactions.currency_id = currencies.id
        WHERE is_pending = 0 AND is_loan = 1 AND ((buyer_borrower_id = $user AND seller_lender_id = $target) OR (buyer_borrower_id = $target AND seller_lender_id = $user))`,
        {
          $user: user.id,
          $target: target_id,
        },
        (error, transactions) => {
          if (error) reject(error);
          if (!transactions.length) resolve(undefined);
          for (const transaction of transactions) {
            if (debts[transaction.name] === undefined)
              debts[transaction.name] = 0;
            debts[transaction.name] +=
              transaction.buyer_borrower_id == user.id
                ? transaction.amount
                : -1 * transaction.amount;
          }
          resolve(trimZeros(debts));
        }
      );
      if (endOperation) db.close();
    });
  },

  async getBalance(interaction, db_ = undefined) {
    user = interaction.user;
    const { endOperation, db } = getLedger(interaction.guild, db_);
    var balances = {};
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT name, amount, buyer_borrower_id 
        FROM transactions
        INNER JOIN currencies
        ON transactions.currency_id = currencies.id
        WHERE is_pending = 0 AND (buyer_borrower_id = $user OR seller_lender_id = $user)`,
        {
          $user: user.id,
        },
        (error, transactions) => {
          if (error) reject(error);
          if (!transactions.length) resolve(undefined);
          for (const transaction of transactions) {
            if (balances[transaction.name] === undefined)
              balances[transaction.name] = 0;
            balances[transaction.name] +=
              transaction.buyer_borrower_id == user.id
                ? transaction.amount
                : -1 * transaction.amount;
          }
          resolve(trimZeros(balances));
        }
      );
      if (endOperation) db.close();
    });
  },

  async getDebts(interaction, db_ = undefined) {
    user = interaction.user;
    const { endOperation, db } = getLedger(interaction.guild, db_);
    var all_debts = {};
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT name, amount, buyer_borrower_id, seller_lender_id 
        FROM transactions
        INNER JOIN currencies
        ON transactions.currency_id = currencies.id
        WHERE is_pending = 0 AND is_loan = 1 AND (buyer_borrower_id = $user OR seller_lender_id = $user)`,
        {
          $user: user.id,
        },
        (error, transactions) => {
          if (error) reject(error);
          if (!transactions.length) resolve(undefined);
          for (const transaction of transactions) {

            const other =
              transaction.buyer_borrower_id == user.id
                ? transaction.seller_lender_id
                : transaction.buyer_borrower_id;
            if (all_debts[other] === undefined) all_debts[other] = {};

            var debts = all_debts[other];
            if (debts[transaction.name] === undefined)
              debts[transaction.name] = 0;

            debts[transaction.name] +=
              transaction.buyer_borrower_id == user.id
                ? transaction.amount
                : -1 * transaction.amount;
          }
          resolve(trimZerosNested(all_debts));
        }
      );
      if (endOperation) db.close();
    });
  },
};
