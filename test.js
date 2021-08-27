require("dotenv").config();
const rpc = process.env.MAINNET_HTTP;
const ContractKit = require("@celo/contractkit");

const kit = ContractKit.newKit(rpc);

const sell = async () => {
  try {
    // This is at lower price I will accept in cUSD for every CELO
    const favorableAmount = 100;
    const amountToExchange = kit.web3.utils.toWei("10", "ether");
    const oneGold = kit.web3.utils.toWei("1", "ether");
    const exchange = await kit.contracts.getExchange();

    const amountOfcUsd = await exchange.quoteGoldSell(oneGold);

    if (amountOfcUsd > favorableAmount) {
      const goldToken = await kit.contracts.getGoldToken();
      const approveTx = await goldToken
        .approve(exchange.address, amountToExchange)
        .send();
      const approveReceipt = await approveTx.waitReceipt();
      console.log("Receipt :", approveReceipt);

      const usdAmount = await exchange.quoteGoldSell(amountToExchange);
      const sellTx = await exchange
        .sellGold(amountToExchange, usdAmount)
        .send();
      const sellReceipt = await sellTx.waitReceipt();
      console.log("Receipt: ", sellReceipt);
    }
  } catch (error) {
    console.log(error);
  }
};
sell();


const buyCelo = async (myAddress) => {
  try {
    const stableToken = await kit.contracts.getStableToken();
    const exchange = await kit.contracts.getExchange();

    const cUsdBalance = await stableToken.balanceOf(myAddress);

    const approveTx = await stableToken
      .approve(exchange.address, cUsdBalance)
      .send();
    const approveReceipt = await approveTx.waitReceipt();
    console.log("Receipt :", approveReceipt);

    const goldAmount = await exchange.quoteUsdSell(cUsdBalance);
    const sellTx = await exchange.sellDollar(cUsdBalance, goldAmount).send();
    const sellReceipt = await sellTx.waitReceipt();
    console.log("Receipt :", approveReceipt);
  } catch (error) {
    console.log(error);
  }
};
// buyCelo("0x13C2F8B8d76F85a9e0f68729Bd933444bFd6F9b6");
