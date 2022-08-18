const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const {
  getCurrencies,
  getCurrency,
  currenciesIsEmpty,
  getDefaultCurrency,
  editCurrency,
  editCurrencyDefault,
} = require("../../../functions/utils/ledger.js");

function updateIfDefined(old, update) {
  return update == undefined ? old : update;
}

// TODO: implement
module.exports = {
  command: (editCurrenct) =>
    editCurrenct
      .setName("edit-currency")
      .setDescription("Edit a currency that is on the server.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name currency you want to edit")
          .setRequired(true)
          .setMaxLength(100)
          .setMinLength(1)
      )
      .addStringOption((option) =>
        option
          .setName("new_name")
          .setDescription("New name for the currency")
          .setRequired(false)
          .setMaxLength(100)
          .setMinLength(1)
      )
      .addStringOption((option) =>
        option
          .setName("symbol")
          .setDescription("New symbol for the currency (i.e. $)")
          .setRequired(false)
          .setMaxLength(100)
      )
      .addBooleanOption((option) =>
        option
          .setName("use_prefix")
          .setDescription(
            "Display the symbol as a prefix (i.e. true: $2, false: 3 dogs)"
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("is_default")
          .setDescription("Set as the default currency for the ledger?")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("has_space")
          .setDescription(
            "Put a space in between amount and symbol? (i.e. true: 12 cats, false: €5)"
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("has_plural")
          .setDescription(
            "Use an s if there is amount greater than 1 (i.e. true: 8 meals false: 16 fish)"
          )
          .setRequired(false)
      ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    if (await currenciesIsEmpty(guild)) {
      await interaction.reply({
        content:
          "There are no currencies to edit. Use /new-currency to add a new currency.",
        ephemeral: true,
      });
      return;
    }

    const name = interaction.options.getString("name");
    const currency = await getCurrency(guild, name);
    if (currency === undefined) {
      interaction.reply({
        content: `${name} could not be found.`,
        ephemeral: true,
      });
      return;
    }

    const new_name = updateIfDefined(
      currency.name,
      interaction.options.getString("new_name")
    );
    const symbol = updateIfDefined(
      currency.symbol,
      interaction.options.getString("symbol")
    );
    const use_prefix = updateIfDefined(
      currency.use_prefix,
      interaction.options.getBoolean("use_prefix")
    );
    const has_space = updateIfDefined(
      currency.has_space,
      interaction.options.getBoolean("has_space")
    );
    const has_plural = updateIfDefined(
      currency.has_plural,
      interaction.options.getBoolean("has_plural")
    );
    var is_default = updateIfDefined(
      currency.is_default,
      interaction.options.getBoolean("is_default")
    );

    const currencies = await getCurrencies(guild);
    // Check if a currency with that name or symbol already exists
    for (const curr of currencies) {
      if (curr.id != currency.id) {
        if (curr.name == new_name) {
          interaction.reply({
            content: "A currency with that name already exists.",
            ephemeral: true,
          });
          return;
        } else if (curr.symbol == symbol) {
          interaction.reply({
            content: "A currency with that symbol already exists.",
            ephemeral: true,
          });
          return;
        } else if (curr.name == symbol) {
          interaction.reply({
            content: "The symbol can not be the name of another currency.",
            ephemeral: true,
          });
          return;
        } else if (curr.symbol == new_name) {
          interaction.reply({
            content: "The name can not be the symbol of another currency.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    var message = "";
    if (!currency.is_default && is_default) {
      // If user tries to make currency default, turn other currency to not default
      const defaultCurrency = await getDefaultCurrency(guild);
      editCurrencyDefault(guild, defaultCurrency.id, false);
      message = `\n(Made ${defaultCurrency.name} no longer default)`;
    } else if (currency.is_default && !is_default) {
      // If user tries to make default currency not default, assign the first avaliable currency to default
      if (currencies.length > 1) {
        editCurrencyDefault(guild, currencies[0].id, true);
        message = `\n(Made ${currencies[0].name} the new default)`;
      } else {
        is_default = true;
        message = `\n(Forced ${name} to be default)`;
      }
    }

    await editCurrency(
      guild,
      currency.id,
      new_name,
      symbol,
      is_default,
      use_prefix,
      has_space,
      has_plural
    );
    interaction.reply({
      content: "Currency has been edited" + message,
      ephemeral: true,
    });
  },
};
