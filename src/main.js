require(`dotenv`).config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } =  require(`discord.js`);
const fs = require(`fs`);

const client = new Client({ intents: GatewayIntentBits.Guilds});
client.commands = new Collection();
client.buttons = new Collection();
client.commandArray = [];

const functionFiles = fs.readdirSync(`./src/functions/handlers`).filter(file => file.endsWith(`.js`));
for (const file of functionFiles) 
    require(`./functions/handlers/${file}`)(client);

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);

// TODO: Notifications for changes in currency and ledger reset
// TODO: implement /help
// TODO: export ledger to csv
// TODO: betting system?