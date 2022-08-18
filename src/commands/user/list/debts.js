const { EmbedBuilder } = require("discord.js");
const { getDebtsTarget, getDebts } = require("../../../functions/utils/ledger.js");
const { isUser, debtsToFields } = require("../../../functions/utils/messages.js");

module.exports = {
  command: (debts) =>
    debts
      .setName("debts")
      .setDescription("Displays your debts")
      .addMentionableOption((option) =>
        option
          .setName("target")
          .setRequired(false)
          .setDescription("Target user to get debts with")
      ),

  async execute(interaction, client) {
    const target = interaction.options.getMentionable("target");
    if (target) {
      // targeted debts
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

      const debts = await getDebtsTarget(interaction, target.user.id);

      if (!debts) {
        await interaction.reply({
          content: `You have no debts with ${target}`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Debts with ${target.user.username}`)
        .setColor(0xffd700)
        .setAuthor({
          name:
            interaction.user.username + "#" + interaction.user.discriminator,
          iconURL: interaction.user.avatarURL(),
        })
        .setTimestamp();

      const debtFields = await debtsToFields(
        debts,
        target.user.username,
        interaction
      );

      embed.addFields(...debtFields);

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } else {
      // Untargeted debts
      const debts = await getDebts(interaction);

      if (!debts) {
        await interaction.reply({
          content: `You have no debts`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Debts`)
        .setColor(0xffd700)
        .setAuthor({
          name:
            interaction.user.username + "#" + interaction.user.discriminator,
          iconURL: interaction.user.avatarURL(),
        })
        .setTimestamp();

      for (const user_id in debts) {
        const user = await client.users.fetch(user_id);
        embed.addFields(
          ...(await debtsToFields(debts[user_id], user.username, interaction))
        );
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  },
};
