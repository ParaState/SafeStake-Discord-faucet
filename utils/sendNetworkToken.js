const Web3 = require('web3');
const erc20_abi = require('./erc20Abi');

module.exports = async (toAddress) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.blockchain_rpc));
  const contract = new web3.eth.Contract(erc20_abi, process.env.erc20_address);
  const transferObjectEncoded = contract.methods.transfer(toAddress, process.env.erc20_token_amount_in_wei).encodeABI();

  const gas = await contract.methods.transfer(toAddress, process.env.erc20_token_amount_in_wei).estimateGas({ from: process.env.faucet_public_key })
  const gasPrice = await web3.eth.getGasPrice();

  const tx = {
    to: process.env.erc20_address,
    from: process.env.faucet_public_key,
    gasPrice: gasPrice,
    gas: gas,
    data: transferObjectEncoded,
  };

  return new Promise(async (resolve, reject) => {
    const signedTX = await web3.eth.accounts.signTransaction(tx, process.env.faucet_private_key);

    console.log(signedTX);

    web3.eth.sendSignedTransaction(signedTX.rawTransaction)
      .on('transactionHash', (hash) => {
        console.log(`Transaction: https://holesky.etherscan.io/tx/${hash}`);
        resolve({ status: 'success', message: hash });
      })
      .on('error', (error) => {
        console.log('error: ', error);
        reject({ status: 'error', message: error });
      });
  });
};
