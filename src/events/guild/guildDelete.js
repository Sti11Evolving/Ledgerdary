const { deleteLedger } = require("../../functions/ledger/ledger.js");

module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild) {
        console.log(`Deleting database for guild ${guild.name}...`);
        deleteLedger(guild);
    }
}