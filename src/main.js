require(`dotenv`).config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits, SelectMenuOptionBuilder } =  require(`discord.js`);
const fs = require(`fs`);

const client = new Client({ intents: GatewayIntentBits.Guilds});
client.commands = new Collection();
client.commandArray = [];

const functionFiles = fs.readdirSync(`./src/functions/handlers`).filter(file => file.endsWith(`.js`));
for (const file of functionFiles) 
    require(`./functions/handlers/${file}`)(client);

client.handleEvents();
client.handleCommands();
client.login(token);
// wot