const { EmbedBuilder } = require("discord.js");

module.exports = {
  command: (help) =>
    help
      .setName("help")
      .setDescription("Information about all of the `/offer` commands"),

  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Offer Help`)
          .setColor(0xffd700)
          .setDescription(
            `The \`/ledger\` command group has commands that are only accesible to server admins for making changes to how Ledgerdary works.
            For first time setup, please use the \`/ledger new-currency\` command so that users can start making trades!
            >>> ⦁ \`()\` indicates that the field is required.
            ⦁ \`[]\` indicates that the field is optional.
            ⦁ You can input true/false for all \`[is_default]\` to set whether or not to use a currency as the default (false is assumed). Ledgerdary will always ensure there is exactly one currency set as the default.`
          )
          .addFields([
            {
              name: "`/ledger new-currency`",
              value: `This command is used to add new currencies that can be used to trade and borrow between users. Until you add a currency, no trading can occur. There are multiple ways to make a new currency using the following subcommands...`,
            },
            {
              name: "> `/ledger new-currency template (templates) [is_default]`",
              value: `> This subcommand is useful for quickly setting up a common currency. You can select from USD, Euro, GBP, Coins, or Points in \`(templates)\`.`,
            },
            {
              name: "> `/ledger new-currency money (name) (symbol) [is_default]`",
              value: `> This subcommand will set up a money-like currency (i.e. something like USD). Input the \`(name)\` to search the currency by and the \`(symbol)\` to append to amounts (i.e. 8*$*).`,
            },
            {
              name: "> `/ledger new-currency object (name) [is_default] [has_plural]`",
              value: `> This subcommand will set up an object-like currency (i.e. something like Points). Input the \`(name)\` ***IN THE SINGULAR FORM*** to search the currency by input true/false for \`[has_plural]\` to tell ledgerdary if it should put an s at the end of currency name when displaying multiple (i.e. 14 Point*s*).`,
            },
            {
              name: "> `/ledger new-currency custom (name) (symbol) [use_prefix] [is_default] [has_space] [has_plural]`",
              value: `>>> This subcommand will set up a completely custom currency. ***ONLY USE IF YOU CANNOT USE ANY OF THE OTHERS***. Nearly every currency should be in other catagories, but if you have something that does not work with those, use this.
              Other than the fields already mentioned above...
              \`[use_prefix]\` accepts true/false and indicates if the symbol should be placed before the number/amount or not.
              \`[has_space]\` accepts true/false and indicates if there should be a space inbetweeen the number/amount and the symbol.`,
            },
            {
              name: "`/ledger edit-currency (name) [new_name] [symbol] [use_prefix] [is_default] [has_space] [has_plural]`",
              value: `This command will edit the currency with the name input in \`(name)\`. Any of the parameters can be changed, and any unfilled optional field will not effect the currency.
              Note: Ledgerdary will ensure that there is exactly one default currency.`,
            },
            {
              name: "`/ledger delete-currency (name)`",
              value: `This command will delete the currency with the name input in \`(name)\`.
              Note: Any transaction that used that currency will also be deleted. This action is not reversable.`,
            },
            {
              name: "`/ledger reset`",
              value: `This command will delete the whole ledger including all added currencies! Only do this if you want a completely new ledger!
              Note: This is not reversable and ***ALL DATA WILL BE LOST!***`,
            },
          ]),
      ],
      ephemeral: true,
    });
  },
};
