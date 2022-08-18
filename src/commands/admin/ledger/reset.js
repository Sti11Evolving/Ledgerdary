const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");
const { newLedger } = require("../../../functions/utils/ledger.js");
const fs = require("fs");

module.exports = {
  command: (reset) =>
    reset
    .setName("reset")
    .setDescription("Creates a new ledger for the server"),

  async execute(interaction, client) {
    if (!fs.existsSync(`./ledgers/${interaction.guild.id}.db`)) {
      await newLedger(interaction.guild);
      await interaction.reply({
        content: "New Ledger has been made!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "A ledger already exists for this server. Creating a new ledger would PERMANENTLY delete the trade history and all of its settings. This is a hard reset. Are you certain you want to do this?",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("reset-ledger")
              .setLabel("I'm certain.")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("abort")
              .setLabel("Abort!")
              .setStyle(ButtonStyle.Success)
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
