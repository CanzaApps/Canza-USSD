require("dotenv").config();
const rpc = process.env.MAINNET_HTTP;
const ContractKit = require("@celo/contractkit");

const kit = ContractKit.newKit(rpc);

const createWallet = async () => {
  console.log("reaches here");
  try {
    const wallet = await kit.web3.eth.accounts.create();
    return wallet;
  } catch (error) {
    console.log(error);
  }
};
// createWallet();
const getBalance = async (account) => {
  try {
    const balance = await kit.web3.eth.getBalance(account);
    return balance;
  } catch (error) {
    console.log(error);
  }
};

const totalBalances = async (account) => {
  try {
    const totalBalance = await kit.getTotalBalance(account);
    return totalBalance;
  } catch (error) {
    console.log(error);
  }
};

const sendFund = async (sendersData, recipientData, amount) => {
  return new Promise(async (resolve, reject) => {
    var nonce = await web3.eth.getTransactionCount(sendersData.address);
    web3.eth.getBalance(sendersData.address, async (err, result) => {
      if (err) {
        return reject();
      }
      let balance = web3.utils.fromWei(result, "ether");
      console.log(balance + " ETH");
      if (balance < amountToSend) {
        console.log("insufficient funds");
        return reject();
      }

      let gasPrices = await getCurrentGasPrices();
      let details = {
        to: recipientData.address,
        value: web3.utils.toHex(
          web3.utils.toWei(amountToSend.toString(), "ether")
        ),
        gas: 21000,
        gasPrice: gasPrices.low * 1000000000,
        nonce: nonce,
        chainId: 4, // EIP 155 chainId - mainnet: 1, rinkeby: 4
      };

      const transaction = new EthereumTx(details, { chain: "rinkeby" });
      let privateKey = sendersData.privateKey.split("0x");
      let privKey = Buffer.from(privateKey[1], "hex");
      transaction.sign(privKey);

      const serializedTransaction = transaction.serialize();

      web3.eth.sendSignedTransaction(
        "0x" + serializedTransaction.toString("hex"),
        (err, id) => {
          if (err) {
            console.log(err);
            return reject();
          }
          const url = `https://rinkeby.etherscan.io/tx/${id}`;
          console.log(url);
          resolve({ id: id, link: url });
        }
      );
    });
  });
};
// getBalance("0x130f747511d3581abc46654dd5f3d1b7910242d5")

const send = async (senderData, recipient, amount) => {
  try {
    const sender = await kit.web3.eth.getTransactionCount(senderData.address);
    const tx = await kit.sendTransaction({
      from: sender,
      to: recipient,
      value: amount,
    });
    const hash = await tx.getHash();
    console.log(`The transaction hash: ${hash}`);
    const receipt = await tx.waitReceipt();
    return receipt;
  } catch (error) {
    console.log(error);
  }
};

const sellCelo = async () => {
  try {
    const rate = 100;
    const amountToExchange = await kit.web3.utils.toWei("10", "ether");
    const exchange = await kit.contracts.getExchange();

    const cUSDAmount = await exchange.quoteGoldSell(amountToExchange);

    if (cUSDAmount > rate) {
      const token = await kit.contracts.getGoldToken();
      const approveTransaction = await token
        .approve(exchange.address, amountToExchange)
        .send();
      const transactionReceipt = await approveTransaction.waitReceipt();
      console.log("Transaction Receipt: ", transactionReceipt);

      const usdAmount = await exchange.quoteGoldBuy(amountToExchange);
      const sellTransanction = await exchange
        .sellGold(amountToExchange, usdAmount)
        .send();
      const sellTransanctionReceipt = await sellTransanction.waitReceipt();
      console.log("Sell Transaction Receipt: ", sellTransanctionReceipt);
    }
  } catch (error) {
    console.log(error);
  }
};
const buyCelo = async (amount) => {
  const stableToken = await kit.contracts.getStableToken();
  const exchange = await kit.contracts.getExchange();

  const cUsdBalance = await stableToken.balanceOf(myAddress);

  const approveTx = await stableToken
    .approve(exchange.address, cUsdBalance)
    .send();
  const approveReceipt = await approveTx.waitReceipt();

  const goldAmount = await exchange.quoteUsdSell(cUsdBalance);
  const sellTx = await exchange.sellDollar(cUsdBalance, goldAmount).send();
  const sellReceipt = await sellTx.waitReceipt();
};
module.exports = { createWallet, getBalance, totalBalances, sellCelo, buyCelo };
