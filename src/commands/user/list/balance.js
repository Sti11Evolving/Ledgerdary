const { EmbedBuilder } = require("discord.js");
const {
  getBalanceTarget,
  getBalance,
  currencyAmountToString,
  getCurrency,
} = require("../../../functions/utils/ledger.js");
const { isUser } = require("../../../functions/utils/messages.js");

module.exports = {
  command: (balance) =>
    balance
    .setName("balance")
    .setDescription("Displays your current balance")
    .addMentionableOption((option) =>
      option
        .setName("target")
        .setRequired(false)
        .setDescription("Target user to get balance with")
    ),

  async execute(interaction, client) {
    target = interaction.options.getMentionable("target");
    if (target) {
      // targeted balance
      if (!(await isUser(target))) {
        await interaction.reply({
          content: "The input target is not a user.",
          ephemeral: true,
        });
        return;
      } else if (target.user == interaction.user) {
        await interaction.reply({
          content: "You cannot target yourself.",
          ephemeral: true,
        });
        return;
      }

      const balance = await getBalanceTarget(interaction, target.user.id);

      if (!balance) {
        await interaction.reply({
          content: `You have no balance with ${target}`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Balance with ${target.user.username}`)
        .setColor(0xffd700)
        .setAuthor({
          name:
            interaction.user.username + "#" + interaction.user.discriminator,
          iconURL: interaction.user.avatarURL(),
        })
        .setTimestamp();


      for (const name in balance) {
        embed.addFields({
          name: name,
          value: await currencyAmountToString(
            await getCurrency(interaction.guild, name),
            balance[name]
          ),
          inline: true,
        });
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else {
      // untargeted balance
      const balance = await getBalance(interaction);

      if (!balance) {
        await interaction.reply({
          content: `You have no balance`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Balance")
        .setColor(0xffd700)
        .setAuthor({
          name:
            interaction.user.username + "#" + interaction.user.discriminator,
          iconURL: interaction.user.avatarURL(),
        })
        .setTimestamp();

      for (const name in balance) {
        embed.addFields({
          name: name,
          value: await currencyAmountToString(
            await getCurrency(interaction.guild, name),
            balance[name]
          ),
          inline: true,
        });
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
