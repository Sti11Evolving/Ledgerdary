const { SlashCommandBuilder } = require("discord.js");
const { ledgerExists } = require("../../functions/utils/ledger.js");
const balance = require("./list/balance.js");
const debts = require("./list/debts.js");
const currencies = require("./list/currencies.js");
const help = require("./list/help.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDMPermission(false)
    .setDescription("Lists information on ledger")
    .addSubcommand(balance.command)
    .addSubcommand(debts.command)
    .addSubcommand(currencies.command)
    .addSubcommand(help.command),

  async execute(interaction, client) {
    if (!ledgerExists(interaction.guild)) {
      await newLedger(interaction.guild);
    }

    switch (interaction.options.getSubcommand()) {
      case "balance":
        balance.execute(interaction, client);
        break;

      case "debts":
        debts.execute(interaction, client);
        break;

      case "currencies":
        currencies.execute(interaction, client);
        break;

      case "help":
        help.execute(interaction, client);
        break;

      default:
        throw new Error("Not a command: ", interaction.options.getSubcommand());
    }
  },
};
