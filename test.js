const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const ContractKit = require("@celo/contractkit");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
// console.log(kit);

// const createAccount = async () => {
//     const 
// }
const getBalance = async (account) => {
    const balance = await kit.getTotalBalance(account);
    console.log(balance);
}
getBalance("0x130f747511d3581abc46654dd5f3d1b7910242d5")
// getBalance("0xe650CFaCBCBa96D0535CFf72e7B7D42097A40Afa")