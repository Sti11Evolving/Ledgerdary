const {
  removeTransactions,
  canDeclineTransaction,
} = require("../../functions/utils/ledger.js");
const { EmbedBuilder } = require(`discord.js`);

module.exports = {
  data: {
    name: "transaction-decline",
  },
  async execute(interaction, client) {
    if (!(await canDeclineTransaction(interaction))) {
      await interaction.reply({
        content: "You are not allowed to decline this transaction.",
        ephemeral: true,
      });
      return;
    }

    try {
      await removeTransactions(
        interaction.guild,
        interaction.message.interaction.id
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "transaction could not be fulfilled",
        ephemeral: true,
      });
      return;
    }

    interaction.update({
      content: "",
      embeds: [
        EmbedBuilder.from(interaction.message.embeds[0])
          .addFields({
            name: "\u200B",
            value: `\n*transaction declined by ${interaction.user}*`,
          })
          .setTimestamp(),
      ],
      components: [],
    });
  },
};
