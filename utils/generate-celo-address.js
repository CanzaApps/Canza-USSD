const dotenv = require("dotenv").config();
const alfatores = process.env.ALFAJORES;
const Web3 = require("web3");

const web3 = new Web3(alfatores);
const createWallet = async() => {
    try {
        const wallet = await web3.eth.accounts.create();
        // console.log(wallet);
        return wallet;
    } catch (error) {
        console.log(error);
    }
}
// createWallet();
const getBalance = async (account) => {
    try {
        const balance = await web3.eth.getBalance(account);
        // console.log(balance);
        return balance
        
    } catch (error) {
        console.log(error);
    }
}
// getBalance("0x130f747511d3581abc46654dd5f3d1b7910242d5")
module.exports = {getBalance, createWallet}