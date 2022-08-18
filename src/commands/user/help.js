const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays information about commands"),

  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Ledgerdary Help`)
          .setColor(0xffd700)
          .setDescription(
            `Ledgerdary is a bot that can help you track debts and purchaces between you and your friends!`
          )
          .addFields([
            {
              name: "`/offer help`",
              value: `For help with how to trade with or loan to other users, or information on all trading and lending commands.`,
            },
            {
              name: "`/list help`",
              value: `For help on how to see information about the ledger such as your current debts and balances.`,
            },
            {
              name: "`/ledger help`",
              value: `For information if you are an admin and need help with setup.`,
            },
          ]),
      ],
      ephemeral: true,
    });
  },
};
