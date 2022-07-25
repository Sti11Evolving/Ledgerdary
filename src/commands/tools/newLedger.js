const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("../../events/client/ready");
const { newLedger } = require("../../functions/ledger/ledger.js");
const { sql } = require("sqlite3");

// TODO: funcitonality
module.exports = {
  data: new SlashCommandBuilder()
    .setName("new-ledger")
    .setDescription("Creates a new ledger for the server")
    .setDefaultMemberPermissions(0),

  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    await newLedger(interaction.guild);

    await interaction.editReply({
      content: "New Ledger has been made!",
    });
  },
};
