const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const {
  currencyAmountToString,
  pendTransaction,
  currenciesIsEmpty,
  getCurrency,
} = require("../../../functions/utils/ledger.js");
const { isUser } = require("../../../functions/utils/messages.js");

module.exports = {
  command: (give) =>
    give
    .setName("lend")
    .setDescription("Lend to another user")
    .addMentionableOption((option) =>
      option.setName("user").setDescription("User to lend to").setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("How much you want to lend")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("What currency want to lend")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for lending")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    if (await currenciesIsEmpty(interaction.guild)) {
      await interaction.reply({
        content:
          "There are no currencies. Ask your server admin(s) to add a currency.",
        ephemeral: true,
      });
      return;
    }

    const reason = interaction.options.getString("reason");
    const amount = interaction.options.getNumber("amount");
    if (amount < 0) {
      await interaction.reply({
        content: "Amount must be positive.",
        ephemeral: true,
      });
      return;
    }

    var lender = interaction.user;
    var borrower = interaction.options.getMentionable("user");
    if (!(await isUser(borrower))) {
      await interaction.reply({
        content: "The input borrower is not a user.",
        ephemeral: true,
      });
      return;
    } else if (borrower.user == interaction.user) {
      await interaction.reply({
        content: "You cannot target yourself.",
        ephemeral: true,
      });
      return;
    }

    const currency = await getCurrency(
      interaction.guild,
      interaction.options.getString("currency")
    );
    if (!currency) {
      await interaction.reply({
        content: "The currency is not valid.",
        ephemeral: true,
      });
      return;
    }
    var str = await currencyAmountToString(currency, amount);

    const timestamp = Date.now();
    await pendTransaction(
      interaction.guild,
      interaction.id,
      borrower.id,
      lender.id,
      currency.id,
      amount,
      timestamp,
      true,
      reason
    );

    const embed = new EmbedBuilder()
      .setTitle(`Lend Offer for ${borrower.user.username}`)
      .setColor(0xffd700)
      .setAuthor({
        name: lender.username + "#" + lender.discriminator,
        iconURL: lender.avatarURL(),
      })
      .setDescription(`${lender} wants to lend you.\n
                        Note: This will add to your debt to ${lender}.`)
      .addFields(
        { name: `You Get`, value: `${str}`, inline: true },
      )
      .setTimestamp();
    if (reason) embed.addFields({ name: "Reason", value: reason });
    await interaction.reply({
      content: `${borrower}`,
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("transaction-agree")
            .setLabel("Agree")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("transaction-decline")
            .setLabel("Decline")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
      ephemeral: false,
    });
  },
};
