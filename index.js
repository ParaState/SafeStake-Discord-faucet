const fs = require('node:fs');
require('dotenv').config();
const path = require('path');
const {
  Client, Collection, Events, GatewayIntentBits,
} = require('discord.js');
const Keyv = require('keyv');
const moment = require('moment');
const isAddress = require('./utils/address');
const sqlLock = require('sql-lock');

const keyv = new Keyv(process.env.database_uri);

keyv.on('error', err => console.log('Connection Error', err));

sqlLock.initialize(process.env.database_uri, { locking_ttl: 30000 });

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
    if (command.data.name === 'faucet-dvt') {
      const address = interaction.options.get('address').value.trim();

      await interaction.deferReply();

      if (interaction.channel.id !== '1112339492364365889') {
        return interaction.editReply('You can not use this command in this channel');
      }

      if (!isAddress(address)) {
        return interaction.editReply('Please enter a valid Address');
      }

      if ((await keyv.get(`discord-faucet-dvt-lasttx-week-${interaction.user.id}`)) === moment().startOf('isoweek').format("YYYY-MM-DD")) {
        return interaction.editReply('You have reached the rate limit! You have already received the DVT tokens for this week.');
      }

      if ((await keyv.get(`ethaddress-faucet-dvt-lasttx-week-${address}`)) === moment().startOf('isoweek').format("YYYY-MM-DD")) {
        return interaction.editReply(`Sorry! the address of ${address} has already been funded for this week.`);
      }
    }

    await command.execute(interaction);

    if (command.data.name === 'faucet-dvt') {
      await keyv.set(`discord-faucet-dvt-lasttx-week-${interaction.user.id}`, moment().startOf('isoweek').format("YYYY-MM-DD"));

      // const lockReleaser = await sqlLock.getLock(address, 3000);
      await keyv.set(`ethaddress-faucet-dvt-lasttx-week-${address}`, moment().startOf('isoweek').format("YYYY-MM-DD"));
      // lockReleaser();
    }
  } catch (error) {
    if (error.code === 10062) return;
    if (error.code === 40060) return;
    console.error(error);
    return interaction.editReply({ content: 'Command execution completed', ephemeral: true });
  }
});

client.login(process.env.discord_bot_token);
