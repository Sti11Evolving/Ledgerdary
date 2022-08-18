const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const {
  currencyAmountToString,
  pendTransaction,
  currenciesIsEmpty,
  getCurrency,
} = require("../../../functions/utils/ledger.js");
const { isUser } = require("../../../functions/utils/messages.js");

module.exports = {
  command: (trade) =>
    trade
    .setName("trade")
    .setDescription("Trade with another user")
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("User to trade with")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("buy_amount")
        .setDescription("How much you want to buy")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("sell_amount")
        .setDescription("How much you want to sell")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("buy_currency")
        .setDescription("What currency you want buy")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("sell_currency")
        .setDescription("What currency you want sell")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for trade")
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
    const buy_amount = interaction.options.getNumber("buy_amount");
    const sell_amount = interaction.options.getNumber("sell_amount");
    if (buy_amount < 0 || sell_amount < 0) {
      await interaction.reply({
        content: "Amounts must be positive.",
        ephemeral: true,
      });
      return;
    }
    var buyer = interaction.user;
    var seller = interaction.options.getMentionable("user");
    if (!(await isUser(seller))) {
      await interaction.reply({
        content: "The input seller is not a user.",
        ephemeral: true,
      });
      return;
    } else if (seller.user == interaction.user) {
      await interaction.reply({
        content: "You cannot target yourself.",
        ephemeral: true,
      });
      return;
    }

    const buy_currency = await getCurrency(
      interaction.guild,
      interaction.options.getString("buy_currency")
    );
    if (!buy_currency) {
      await interaction.reply({
        content: "The buy currency is not valid.",
        ephemeral: true,
      });
      return;
    }
    var buy_str = await currencyAmountToString(buy_currency, buy_amount);

    const sell_currency = await getCurrency(
      interaction.guild,
      interaction.options.getString("sell_currency")
    );
    if (!sell_currency) {
      await interaction.reply({
        content: "The sell currency is not valid.",
        ephemeral: true,
      });
      return;
    }
    var sell_str = await currencyAmountToString(sell_currency, sell_amount);

    const timestamp = Date.now();
    await pendTransaction(
      interaction.guild,
      interaction.id,
      buyer.id,
      seller.id,
      buy_currency.id,
      buy_amount,
      timestamp,
      false,
      reason
    );
    await pendTransaction(
      interaction.guild,
      interaction.id,
      seller.id,
      buyer.id,
      sell_currency.id,
      sell_amount,
      timestamp,
      false,
      reason
    );

    const embed = new EmbedBuilder()
      .setTitle(`Trade Offer for ${seller.user.username}`)
      .setColor(0xffd700)
      .setAuthor({
        name: buyer.username + "#" + buyer.discriminator,
        iconURL: buyer.avatarURL(),
      })
      .setDescription(`${buyer} wants to trade with you.`)
      .addFields(
        { name: `You Get`, value: `${sell_str}`, inline: true },
        { name: `They Get`, value: `${buy_str}`, inline: true }
      )
      .setTimestamp();
    if (reason) embed.addFields({ name: "Reason", value: reason });
    await interaction.reply({
      content: `${seller}`,
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
