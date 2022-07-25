const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("../../events/client/ready");
const { deleteLedger } = require("../../functions/ledger/ledger.js");
const { sql } = require("sqlite3");

// TODO: funcitonality
module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-ledger")
    .setDescription("Deletes the ledger from the server")
    .setDefaultMemberPermissions(0),

  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    await deleteLedger(interaction.guild);

    await interaction.editReply({
      content: "Ledger has been deleted.",
    });
  },
};
