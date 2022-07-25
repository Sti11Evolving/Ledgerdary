module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      var command;
      // Ensure that we actually have commands
      if (commands) command = commands.get(commandName);
      else {
        console.error(
          "This beach empty! *YEET*: Probably some error with multiple instances of the bot running"
        );
        return;
      }

      if (!command) console.error(`Command ${commandName} not identified`);

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);

        // Try and tell the user that something went wrong. Use a normal reply if you can, but if it fails, edit the reply that is already there.
        try {
          await interaction.reply({
            content: `Oops! Looks like something went wrong with this command...`,
            ephemeral: true,
          });
        } catch (error) {
          await interaction.editReply(`Oops! Looks like something went wrong with this command...`);
        }
      }
    }
  },
};
