const { EmbedBuilder } = require("discord.js");
const { getCurrencies, currencyAmountToString } = require("../../../functions/utils/ledger.js");

module.exports = {
  command: (currencies) =>
    currencies
      .setName("currencies")
      .setDescription("Displays a list of all currencies on this server"),

  async execute(interaction, client) {
    const currencies = await getCurrencies(interaction.guild);

    if (currencies.length == 0) {
      interaction.reply({
        content:
          "There are no currencies to list. Ask your server admin(s) to add a currency.",
        ephemeral: true,
      });
      return;
    }

    var fields = [
      { name: "Name", value: "", inline: true },
      { name: "Symbol", value: "", inline: true },
      { name: "Example", value: "", inline: true },
      { name: "Default currency", value: "" },
    ];
    for (const currency of currencies) {
      fields[0].value += currency.name + "\n";
      fields[1].value += currency.symbol + "\n";
      fields[2].value +=
        (await currencyAmountToString(
          currency,
          Math.floor(Math.random() * 101) // Random integer between 0 and 100
        )) + "\n";
      if (currency.is_default) fields[3].value = currency.name;
    }

    const listEmbed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("Currency list")
      .addFields(fields);

    interaction.reply({
      embeds: [listEmbed],
      ephemeral: true,
    });
  },
};
