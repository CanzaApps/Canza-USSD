require("dotenv").config();
const rpc = process.env.MAINNET_HTTP;
const  ContractKit = require("@celo/contractkit");

const kit = ContractKit.newKit(rpc);

const createWallet = async() => {
    console.log("reaches here")
    try {
        const wallet = await kit.web3.eth.accounts.create();
        return wallet;
    } catch (error) {
        console.log(error);
    }
}
createWallet();
// const getBalance = async (account) => {
//     try {
//         const balance = await kit.web3.eth.getBalance(account);
//         return balance
        
//     } catch (error) {
//         console.log(error);
//     }
// }

// const totalBalances = async (account) => {
//     try {
//         const totalBalance = await kit.getTotalBalance(account);
//         return totalBalance;
//     } catch (error) {
//         console.log(error);
//     }
// }
// // getBalance("0x130f747511d3581abc46654dd5f3d1b7910242d5")
// module.exports = {createWallet, getBalance, totalBalances}
//  createWallet}