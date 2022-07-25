const { SlashCommandBuilder } = require("discord.js");
const { execute } = require("../../events/client/ready");

// TODO: Functionality
module.exports = {
  data: 
  new SlashCommandBuilder()
    .setName("bal")
    .setDescription("returns your current balance")
    /*.addMentionableOption(option =>
      option
        .setName('user')
        .setRequired(true)
        .setDescription('User to get balance with')
    )*/,

  async execute(interaction, client) {
    const newMessege = `API Latency: ${client.ws.ping}\nClient Ping: ${
      message.createdTimestamp - interaction.createdTimestamp
    }`;

    await interaction.editReply({
      content: newMessege,
    });
  },
};
