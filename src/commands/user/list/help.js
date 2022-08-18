const { EmbedBuilder } = require("discord.js");

module.exports = {
  command: (help) =>
    help
      .setName("help")
      .setDescription("Information about all of the `/list` commands"),

  async execute(interaction, client) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`List Help`)
          .setColor(0xffd700)
          .setDescription(
            `The \`/list\` command group has commands that allow you to see information on the ledger.
            >>>\`[]\` indicates that the field is optional.`
          )
          .addFields([
            {
              name: "`/list balance [target]`",
              value: `This command will display your balance. This includes money aquired through loans (if someone loaned you money, it will appear as a positive amount in your account, much like a bank account).
              If you use the optional target field, you will only see your balance with that one user.`,
            },
            {
              name: "`/list debts [target]`",
              value: `This command will display your debts with each user. This will NOT include any transactions that are trades.
              If you use the optional target field, you will only see your debts with that one user.`,
            },
            {
              name: "`/list currencies`",
              value: `This command will display all of the currencies that are active on the server.`,
            },
          ]),
      ],
      ephemeral: true,
    });
  },
};
