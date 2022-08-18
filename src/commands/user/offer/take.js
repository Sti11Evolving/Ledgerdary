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
  command: (take) =>
    take
    .setName("take")
    .setDescription("Take from another user")
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("User to take from")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("How much you want to take")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("What currency want to take")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for taking")
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
    var taker = interaction.user;
    var giver = interaction.options.getMentionable("user");
    if (!await isUser(giver)){
      await interaction.reply({
        content: "The input giver is not a user.",
        ephemeral: true,
      });
      return;
    } else if (giver.user == interaction.user) {
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
      .setTitle(`Take Offer for ${giver.user.username}`)
      .setColor(0xffd700)
      .setAuthor({
        name: taker.username + "#" + taker.discriminator,
        iconURL: taker.avatarURL(),
      })
      .setDescription(`${taker} wants to take from you.\n
                      Note: ${taker} does NOT have to pay you back.`)
      .addFields(
        { name: `They Get`, value: `${str}`, inline: true },
      )
      .setTimestamp();
    if (reason) embed.addFields({ name: "Reason", value: reason });
    await interaction.reply({
      content: `${giver}`,
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
