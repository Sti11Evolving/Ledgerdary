const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const {
  getCurrency,
  deleteCurrency,
  getCurrencies,
} = require("../../../functions/utils/ledger.js");

module.exports = {
  command: (deleteCurrency) =>
    deleteCurrency
    .setName("delete-currency")
    .setDescription("Delete a currency")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name currency you want to delete. [THIS WILL DELETE ALL TRASACTIONS THAT USED THIS CURRENCY]")
        .setRequired(true)
        .setMaxLength(100)
        .setMinLength(1)
    ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const currency = await getCurrency(
      guild,
      interaction.options.getString("name")
    );
    if (currency === undefined) {
      interaction.reply({
        content: "The currency could not be found",
        ephemeral: true,
      });
      return;
    }

    var message = "";
    if (currency.is_default) {
      const currencies = await getCurrencies(guild);
      if (currencies.length > 1) {
        editCurrencyDefault(guild, currencies[0].id, true);
        message = `\n(Made ${currencies[0].name} the new default)`;
      } else {
        message = `\n(${currency.name} was the last currency. Please add a new currency using /new-currency)`
      }
    }

    await deleteCurrency(guild, currency.id);

    interaction.reply({
      content: `${currency.name} was deleted.` + message,
      ephemeral: true,
    });
  },
};