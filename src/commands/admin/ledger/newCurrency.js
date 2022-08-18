const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  newCurrency,
  getCurrencies,
} = require("../../../functions/utils/ledger.js");

module.exports = {
  command: (newCurrency) =>
    newCurrency
      .setName("new-currency")
      .setDescription("Creates a new currency")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("template")
          .setDescription("Select from these pre-made currencies")
          .addStringOption((option) =>
            option
              .setName("templates")
              .setDescription("Choose from the given templates")
              .addChoices(
                { name: "USD", value: "usd" },
                { name: "Euro", value: "euro" },
                { name: "GPB", value: "gbp" },
                { name: "Coins", value: "coins" },
                { name: "Points", value: "points" }
              )
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName("is_default")
              .setDescription("Set as the default currency for the ledger?")
              .setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("money")
          .setDescription(
            "For making currencies that are money like (i.e. trading USD)"
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the currency (i.e. USD)")
              .setRequired(true)
              .setMaxLength(100)
              .setMinLength(1)
          )
          .addStringOption((option) =>
            option
              .setName("symbol")
              .setDescription("Symbol for the currency (i.e. $)")
              .setRequired(false)
              .setMaxLength(100)
          )
          .addBooleanOption((option) =>
            option
              .setName("is_default")
              .setDescription("Set as the default currency for the ledger?")
              .setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("object")
          .setDescription(
            "For making currencies that are object like (i.e. trading points)"
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("[USE SINGULAR] Name of the currency (i.e. cat)")
              .setRequired(true)
              .setMaxLength(100)
              .setMinLength(1)
          )
          .addBooleanOption((option) =>
            option
              .setName("is_default")
              .setDescription("Set as the default currency for the ledger?")
              .setRequired(false)
          )
          .addBooleanOption((option) =>
            option
              .setName("has_plural")
              .setDescription(
                "Use an s if there is amount greater than 1 (i.e. true: 8 meals false: 16 fish)"
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("custom")
          .setDescription("make a completely custom currency")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Name of the currency (i.e. USD)")
              .setRequired(true)
              .setMaxLength(100)
              .setMinLength(1)
          )
          .addStringOption((option) =>
            option
              .setName("symbol")
              .setDescription("Symbol for the currency (i.e. $)")
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
          )
      ),

  async execute(interaction, client) {
    var name, symbol, is_default, use_prefix, has_space, has_plural;

    switch (interaction.options.getSubcommand()) {
      case "custom":
        name = interaction.options.getString("name");
        symbol = interaction.options.getString("symbol");
        is_default = interaction.options.getBoolean("is_default");
        use_prefix = interaction.options.getBoolean("use_prefix");
        has_space = interaction.options.getBoolean("has_space");
        has_plural = interaction.options.getBoolean("has_plural");
        break;

      case "money":
        name = interaction.options.getString("name");
        symbol = interaction.options.getString("symbol");
        is_default = interaction.options.getBoolean("is_default");
        use_prefix = true;
        has_space = false;
        has_plural = false;
        break;

      case "object":
        name = interaction.options.getString("name");
        symbol = interaction.options.getString("name");
        is_default = interaction.options.getBoolean("is_default");
        use_prefix = false;
        has_space = true;
        has_plural = interaction.options.getBoolean("has_plural");
        break;

      case "template":
        switch (interaction.options.getString("templates")) {
          case "usd":
            name = "USD";
            symbol = "$";
            is_default = interaction.options.getBoolean("is_default");
            use_prefix = true;
            has_space = false;
            has_plural = false;
            break;

          case "euro":
            name = "Euro";
            symbol = "€";
            is_default = interaction.options.getBoolean("is_default");
            use_prefix = true;
            has_space = false;
            has_plural = false;
            break;

          case "gbp":
            name = "Pound";
            symbol = "£";
            is_default = interaction.options.getBoolean("is_default");
            use_prefix = true;
            has_space = false;
            has_plural = false;
            break;

          case "coins":
            name = "Coins";
            symbol = "Coin";
            is_default = interaction.options.getBoolean("is_default");
            use_prefix = false;
            has_space = true;
            has_plural = true;
            break;

          case "points":
            name = "Points";
            symbol = "Point";
            is_default = interaction.options.getBoolean("is_default");
            use_prefix = false;
            has_space = true;
            has_plural = true;
            break;

          default:
            throw new Error(
              "Not a template: ",
              interaction.options.getString("templates")
            );
        }
        break;

      default:
        throw new Error("Not a command: ", interaction.options.getSubcommand());
    }

    const currencies = await getCurrencies(interaction.guild);
    // Check if a currency with that name or symbol already exists
    for (const curr of currencies) {
      if (curr.name == name) {
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
      } else if (curr.symbol == name) {
        interaction.reply({
          content: "The name can not be the symbol of another currency.",
          ephemeral: true,
        });
        return;
      }
    }

    await newCurrency(
      interaction.guild,
      name,
      symbol,
      is_default,
      use_prefix,
      has_space,
      has_plural
    );

    await interaction.reply({
      content: `Currency ${name} has been added.`,
      ephemeral: false,
    });
  },
};
