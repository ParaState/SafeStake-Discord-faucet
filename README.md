# FaucetBot
This is a Discord bot that dispenses Goerli State token. 

![image](https://i.imgur.com/SIpNZ77.png)

# Requirements
* Npm
* Node.js

# Setup
* Register an application and get a token [from here](https://discord.com/developers/applications)
* Rename the `.env.example` file to `.env`
* Add the bot token, Alchemy URL, wallet keys, and the guild/client IDs to the `.env` file 
Note: The client ID is the application ID of the bot. You can get this from the application page or by right-clicking the bot and selecting "Copy ID". 
The guild ID is the ID of the server you want the bot to be in. You can get this by right-clicking the server and selecting "Copy ID".

* Install with
```bash
npm install
```
* Run `node deploy-commands.js` to [register your slash commands](https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands).
Note: Deploy is at guild level by default. You can change this by updating the `deploy-commands.js` file. 
# Usage
* Start the bot with
```bash
node .
# or with PM2 (recommended)
npm install -g pm2
pm2 start index.js 
```
I highly recommend a process manager such as [PM2](https://pm2.keymetrics.io/) or [forever](https://github.com/foreversd/forever) to make sure the bot stays up.
* Use `/faucet <address>` to request funds.

# Env
You can change the following in the `.env` file: 
* `database_uri`: mysql database uri, for example: mysql://username:password@host:port/dbname
* `faucet_private_key`: Private key of faucet account
* `faucet_public_key`: Public key of faucet account
* `erc20_token_amount_in_wei`: amount of State token to send Per request in wei unit
* `erc20_address`: State token contract address
* `blockchain_rpc`: RPC Provider URL of goerli Testnet Network
