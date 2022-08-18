const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const newCurrency = require("./ledger/newCurrency.js");
const editCurrency = require("./ledger/editCurrency.js");
const deleteCurrency = require("./ledger/deleteCurrency.js");
const reset = require("./ledger/reset.js");
const help = require("./ledger/help.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ledger")
    .setDMPermission(false)
    .setDescription("Change ledger settings")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommandGroup(newCurrency.command)
    .addSubcommand(editCurrency.command)
    .addSubcommand(deleteCurrency.command)
    .addSubcommand(reset.command)
    .addSubcommand(help.command),

  async execute(interaction, client) {
    switch (interaction.options.getSubcommandGroup()) {
      case "new-currency":
        newCurrency.execute(interaction, client);
        break;

      default:
        switch (interaction.options.getSubcommand()) {
          case "new-currency":
            newCurrency.execute(interaction, client);
            break;

          case "edit-currency":
            editCurrency.execute(interaction, client);
            break;

          case "delete-currency":
            deleteCurrency.execute(interaction, client);
            break;

          case "reset":
            reset.execute(interaction, client);
            break;

          case "help":
            help.execute(interaction, client);
            break;

          default:
            throw new Error(
              "Not a command: ",
              interaction.options.getSubcommand()
            );
        }
        break;
    }
  },
};
