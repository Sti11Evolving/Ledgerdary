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
    .setName("give")
    .setDescription("Give to another user")
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("User to give to")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("How much you want to give")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("What currency want to give")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for giving")
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
    if (amount < 0){
      await interaction.reply({
        content: "Amount must be positive.",
        ephemeral: true,
      });
      return;
    }
    var giver = interaction.user;
    var taker = interaction.options.getMentionable("user");
    if (!await isUser(taker)){
      await interaction.reply({
        content: "The input taker is not a user.",
        ephemeral: true,
      });
      return;
    } else if (taker.user == interaction.user) {
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
    var str = await currencyAmountToString(
      currency,
      amount,
    );

    const timestamp = Date.now();
    await pendTransaction(
      interaction.guild,
      interaction.id,
      taker.id,
      giver.id,
      currency.id,
      amount,
      timestamp,
      false,
      reason,
    );

    const embed = new EmbedBuilder()
      .setTitle(`Give Offer for ${taker.user.username}`)
      .setColor(0xffd700)
      .setAuthor({
        name: giver.username + "#" + giver.discriminator,
        iconURL: giver.avatarURL(),
      })
      .setDescription(`${giver} wants to give you.\n
                        Note: This will NOT add to your debt to ${giver}.`)
      .addFields(
        { name: `You Get`, value: `${str}`, inline: true },
      )
      .setTimestamp();
    if (reason) embed.addFields({ name: "Reason", value: reason });
    await interaction.reply({
      content: `${taker}`,
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
