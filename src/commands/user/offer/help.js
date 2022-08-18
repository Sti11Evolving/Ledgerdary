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
            `The \`/offer\` command group has commands that allow you make transactions with other users.
            All offers have to be accepted by the user you are offering the transaction to or an admin.
            Debts do not have interest that is automatically applied to the principal of the loan.

            >>> ⦁ \`()\` Indicates that the field is required.
            ⦁ \`[]\` Indicates that the field is optional.
            ⦁ All \`[reason]\` fields are an optional place to record the reason for the particular transaction so it can be preserved.
            ⦁ All \`[currency]\` fields are used to designate the currency to use in the transaction. If no currency is specified, then the default curreny is assumed.
            ⦁ For information on the currencies on the server, use \`/list currencies\``
          )
          .addFields([
            {
              name: "`/offer trade (user) (buy amount) (sell amount) [buy currency] [sell currency] [reason]`",
              value: `This command sends a trade offer to the user input. This will NOT be marked as a loan and is simply a transfer of each currency to each users' account.
              Note: 'Buy' in this case refers to what you want to buy **from** \`(user)\` and sell refers what you want to sell **to** \`(user)\`.`,
            },
            {
              name: "`/offer give (user) (amount) [currency] [reason]`",
              value: `This command sends an offer to give \`(user)\` currency. This will ***NOT*** be marked as a loan and is simply a transfer of currency to \`(user)\`'s account.
              Note: This is essentailly the same as using \`/offer trade\` with buy amount set to 0.`,
            },
            {
              name: "`/offer take (user) (amount) [currency] [reason]`",
              value: `This command sends an offer to take \`(user)\`'s currency. This will ***NOT*** be marked as a loan and is simply a transfer of currency from \`(user)\`'s account.
              Note: This is essentailly the same as using \`/offer trade\` with sell amount set to 0.`,
            },
            {
              name: "`/offer lend (user) (amount) [currency] [reason]`",
              value: `This command sends an offer to lend to \`(user)\`. This ***WILL*** be marked as a loan and will show up as a debt that \`(user)\` owe you back.`,
            },
            {
              name: "`/offer borrow (user) (amount) [currency] [reason]`",
              value: `This command sends an offer to borrow from \`(user)\`. This ***WILL*** be marked as a loan and will show up as a debt that you will owe \`(user)\` back.`,
            },
            {
              name: "`/offer payback (user) (amount) [currency] [reason]`",
              value: `This command sends an offer payback a loan from \`(user)\`. You can only pay up to the amount that you owe \`(user)\`.
              Note: This is essentailly the same thing as \`/offer lend\` but with extra checks to make sure that you are not paying back more than you owe.`,
            }
          ]),
      ],
      ephemeral: true,
    });
  },
};
