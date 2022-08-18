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
  getDebtsTarget,
} = require("../../../functions/utils/ledger.js");
const { isUser } = require("../../../functions/utils/messages.js");

module.exports = {
  command: (payoff) =>
    payoff
    .setName("payoff")
    .setDescription("Payoff loans to another user")
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription("User to payoff loans to")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("How much loan you want to payoff")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("currency")
        .setDescription("What currency of loan do you want to payoff")
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
    
    const amount = interaction.options.getNumber("amount");
    if (amount < 0){
      await interaction.reply({
        content: "Amount must be positive.",
        ephemeral: true,
      });
      return;
    }
    var payer = interaction.user;
    var lender = interaction.options.getMentionable("user");
    if (!await isUser(lender)){
      await interaction.reply({
        content: "The input lender is not a user.",
        ephemeral: true,
      });
      return;
    } else if (lender.user == interaction.user) {
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

    const debts = await getDebtsTarget(interaction, lender.id);
    if (debts == undefined){
      await interaction.reply({
        content: `You have no debts with ${lender}`,
        ephemeral: true,
      });
      return;
    }

    const debt = debts[currency.name];
    if (debt == undefined || debt - amount < 0) {
      await interaction.reply({
        content: "You can't pay off more than you owe",
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
      lender.id,
      payer.id,
      currency.id,
      amount,
      timestamp,
      true,
      "loan payment",
    );

    const embed = new EmbedBuilder()
      .setTitle(`Payoff Offer for ${lender.user.username}`)
      .setColor(0xffd700)
      .setAuthor({
        name: payer.username + "#" + payer.discriminator,
        iconURL: payer.avatarURL(),
      })
      .setDescription(`${payer} wants payoff loans.\n`)
      .addFields(
        { name: `Payoff loans worth`, value: `${str}`, inline: true },
      )
      .setTimestamp();
    await interaction.reply({
      content: `${lender}`,
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
