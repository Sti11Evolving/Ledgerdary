const { newLedger } = require("../../functions/ledger/ledger.js");

module.exports = {
  name: "guidCreate",
  once: false,
  async execute(guild) {
    console.log(`Creating  database for new guild ${guild.name}...`);
    newLedger(guild)
  },
};
