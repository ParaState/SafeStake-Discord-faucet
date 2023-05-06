const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const sendNetworkToken = require('../utils/sendNetworkToken.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faucet-dvt')
    .setDescription('Request testnet DVT token from the faucet')
    .addStringOption((option) => option.setName('address')
      .setDescription('The address to request DVT token from the faucet')
      .setRequired(true)),
  async execute(interaction) {
    const address = interaction.options.get('address').value.trim();

    const reply = 'DVT token sent. Please check the link to see if it\'s mined.';

    await interaction.editReply(reply);

    const receipt = await sendNetworkToken(address);

    if (receipt.status === 'success') {
      const embed = new EmbedBuilder()
        .setColor('#3BA55C')
        .setDescription(`[View on Goeril etherscan](https://goerli.etherscan.io/tx/${receipt.message})`);
      return interaction.followUp({ content: 'Transaction for DVT token created.', embeds: [embed] });
    }
    return interaction.followUp('Failed to send DVT token');
  },
};
