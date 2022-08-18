const { SlashCommandBuilder } = require("discord.js");
const trade = require("./offer/trade.js");
const give = require("./offer/give.js");
const take = require("./offer/take.js");
const lend = require("./offer/lend.js");
const borrow = require("./offer/borrow.js");
const payoff = require("./offer/payoff.js");
const help = require("./offer/help.js");
const { ledgerExists, newLedger } = require("../../functions/utils/ledger.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("offer")
    .setDMPermission(false)
    .setDescription("Offer a transaction with another user")
    .addSubcommand(trade.command)
    .addSubcommand(give.command)
    .addSubcommand(take.command)
    .addSubcommand(lend.command)
    .addSubcommand(borrow.command)
    .addSubcommand(payoff.command)
    .addSubcommand(help.command),

  async execute(interaction, client) {
    if (!ledgerExists(interaction.guild)) {
      await newLedger(interaction.guild);
    }

    switch (interaction.options.getSubcommand()) {
      case "trade":
        trade.execute(interaction, client);
        break;

      case "give":
        give.execute(interaction, client);
        break;

      case "take":
        take.execute(interaction, client);
        break;

      case "lend":
        lend.execute(interaction, client);
        break;

      case "borrow":
        borrow.execute(interaction, client);
        break;

      case "payoff":
        payoff.execute(interaction, client);
        break;

      case "help":
        help.execute(interaction, client);
        break;

      default:
        throw new Error("Not a command: ", interaction.options.getSubcommand());
    }
  },
};
