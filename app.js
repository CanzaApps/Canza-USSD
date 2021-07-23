const express = require("express");
const bodyParser = require("body-parser");
const ussdRouter = require("./index");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use('/', ussdRouter);

app.listen(PORT, () => console.log(`listening to ${PORT}`));