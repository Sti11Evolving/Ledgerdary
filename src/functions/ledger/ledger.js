const sqlite3 = require(`sqlite3`);
const fs = require('fs')

function errorHandler(successMessage){
  return (err) => {
    if (err) console.error(err);
    else if (successMessage) console.info(successMessage);
  }
}

module.exports = {
  async newLedger(guild) {
    console.log(guild.id);
    const db = new sqlite3.Database(
      `./ledgers/${guild.id}.db`,
      errorHandler(`Created new database for server id: ${guild.id}`),
      sqlite3.OPEN_CREATE
    );
    
    const createTablesQuery = 
    `CREATE TABLE trades
    (
      [trade_id] INT IDENTITY(1,1) PRIMARY KEY,
      [buyer_id] INT NOT NULL,
      [seller_id] INT NOT NULL,
      [currency_id] INT NOT NULL,
      [amount] INT NOT NULL,
      [time] INT NOT NULL,
      [reason] VARCHAR(50)
    );
    CREATE TABLE users
    (
      [user_id] INT PRIMARY KEY,
      [reason] VARCHAR(50)
    );`
    db.run()
  },

  async deleteLedger(guild){
    fs.unlink('file.txt');
  },
};

