const express = require("express");
const router = express.Router();
const dotenv = require("dotenv").config();
const ContractKit = require("@celo/contractkit");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
// console.log(kit);

const createAccount = async () => {
    const 
}
const getBalance = async (account) => {
    const balance = await kit.getTotalBalance(account);
    console.log(balance);
}