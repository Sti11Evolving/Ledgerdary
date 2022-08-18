module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      // Ensure that we actually have commands
      if (commands) var command = commands.get(commandName);
      else {
        console.error(
          "This beach empty! *YEET*: Probably some error with multiple instances of the bot running."
        );
        return;
      }

      if (!command) throw new Error(`Command ${commandName} does not exist`);

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
    else if (interaction.isButton()){
      const { buttons } = client;
      const { customId } = interaction;

      // Ensure that we actually have buttons
      if (buttons) var button = buttons.get(customId);
      else {
        console.error(
          "This beach empty! *YEET*: Probably some error with multiple instances of the bot running."
        );
        return;
      }

      if (!button) throw new Error(`Button ${customId} does not exist`);

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(error);

        // Try and tell the user that something went wrong. Use a normal reply if you can, but if it fails, edit the reply that is already there.
        try {
          await interaction.reply({
            content: `Oops! Looks like something went wrong with this button...`,
            ephemeral: true,
          });
        } catch (error) {
          await interaction.editReply(`Oops! Looks like something went wrong with this button...`);
        }
      }
    }
  },
};
