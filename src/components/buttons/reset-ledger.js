const { deleteLedger, newLedger } = require("../../functions/utils/ledger");

module.exports = {
  data: {
    name: "reset-ledger",
  },
  async execute(interaction, client) {
    await deleteLedger(interaction.guild);
    await newLedger(interaction.guild);

    interaction.update({
      content: `The ledger has been reset. Please add a new currency before enacting any trades.`,
      components: [],
    });

    interaction.channel.send("The ledger has been reset!");

  },
};
