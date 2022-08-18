const { currencyAmountToString, getCurrency } = require("./ledger.js");
const { GuildMember } = require("discord.js");

module.exports = {
  async debtsToFields(bal, username, interaction) {
    // Check to confirm bal is not empty BEFORE passing
    // Positive numbers mean you owe money, negative numbers mean they owe you
    var has_pos = false;
    var you_owe = {
      name: `You owe ${username}...`,
      value: "",
      inline: true,
    };
    var has_neg = false;
    var owes_you = {
      name: `${username} owes you...`,
      value: "",
      inline: true,
    };

    for (const name in bal) {
      if (bal[name] != 0) {
        const curr_str = await currencyAmountToString(
          await getCurrency(interaction.guild, name),
          Math.abs(bal[name])
        );
        if (bal[name] > 0) {
          has_pos = true;
          you_owe.value += curr_str + `\n`;
        } else {
          has_neg = true;
          owes_you.value += curr_str + `\n`;
        }
      }
    }

      const fields = [];
      if (has_pos) fields.push(you_owe);
      if (has_neg) fields.push(owes_you);

      return fields;
  },

  async isUser(obj) {
    return obj instanceof GuildMember;
  },
};
