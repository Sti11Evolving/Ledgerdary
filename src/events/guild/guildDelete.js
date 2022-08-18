const { deleteLedger } = require("../../functions/utils/ledger.js");

module.exports = {
  name: "guildDelete",
  once: false,
  async execute(guild) {
    console.log(`Deleting database for guild ${guild.name}...`);
    deleteLedger(guild);
  },
};
