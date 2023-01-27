const fs = require('node:fs');
require('dotenv').config();
const path = require('path');
const {
  Client, Collection, Events, GatewayIntentBits,
} = require('discord.js');
const Keyv = require('keyv');
const moment = require('moment');
const isAddress = require('./utils/address');

const keyv = new Keyv(`sqlite://${path.join(process.env.data_dir, 'discord.sqlite')}`);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log('discord bot is Ready!');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    if (command.data.name === 'faucet') {
      const address = interaction.options.get('address').value.trim();

      await interaction.deferReply();

      if (!isAddress(address)) {
        return interaction.editReply('Please enter a valid Address');
      }

      if ((await keyv.get(`discord-faucet-count-${interaction.user.id}`)) === 6) {
        return interaction.editReply('Rate limit! Your can only request State token three times');
      }

      if ((await keyv.get(`discord-faucet-lasttx-${interaction.user.id}`)) === moment().format('YYYY-MM')) {
        return interaction.editReply('Rate limit! You already received State tokens for this month');
      }
    }

    await command.execute(interaction);

    if (command.data.name === 'faucet') {
      const currentCount = (await keyv.get(`discord-faucet-count-${interaction.user.id}`)) || 0;
      await keyv.set(`discord-faucet-count-${interaction.user.id}`, currentCount + 1);
      await keyv.set(`discord-faucet-lasttx-${interaction.user.id}`, moment().format('YYYY-MM'));
    }
  } catch (error) {
    if (error.code === 10062) return;
    if (error.code === 40060) return;
    console.error(error);
    return interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(process.env.discord_bot_token);
