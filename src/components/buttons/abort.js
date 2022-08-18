module.exports = {
  data: {
    name: "abort",
  },
  async execute(interaction, client) {
    interaction.update({
      content: `This action has been aborted. No changes have been made.`,
      components: [],
    });
  },
};
