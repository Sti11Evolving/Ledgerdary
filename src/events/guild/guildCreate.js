const { newLedger } = require("../../functions/utils/ledger.js");

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guild) {
    console.log(`Creating  database for new guild ${guild.name}...`);
    newLedger(guild);
    console.log(`Done!`);

    const channel = guild.channels.cache.filter(c => c.type == 0).find(x => x.position == 0);
    channel.send("Thank you for using Ledgerdary! A new ledger has just been made for this server!\nIf you are an admin, please use the /new-currency command to add a currency before any trading can happen.\nIf you have any further questions, please use the /help command.\nHappy trading!");
  },
};
