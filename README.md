# Canza-USSD

## TECH USED

## Before you run the app, you have to run ngrok

- [Set up or sign in](https://dashboard.ngrok.com/login) into your Ngrok Account

## Dotenv variables

**Port connection**

- PORT=8000

**DB Connection**

- DEV_MONGO_URI='replace with local Mongodb'
- PRO_MONGO_URI='replace with online Mongodb

**Celo Blockchain Connection**
  
- TEST_NET_ALFAJORES=<https://alfajores-forno.celo-testnet.org>
- MAIN_NET_ALFAJORES=<https://forno.celo.org>

**Crypto**

- SECRET_KEY_HASH=sha256

**Africa's talking api**

- AT_API_KEY=b2db2b9ff7e9098dc558cb21f9d75b5ed39900aac18eda40aa8acb1e62c7959c
- AT_API_USERNAME=sandbox

- AT_API_KEY=
- AT_API_USERNAME=

## Connect your account

Running this command will add your authtoken to the default ngrok.yml configuration file. This will grant you access to more features and longer session times. Running tunnels will be listed on the status page of the dashboard.
  `ngrok authtoken [your token]`

## Start HTTP Tunnel

To start a HTTP tunnel forwarding to your local port 3000, run this next:
`ngrok http 3000 or 8000`

## Install Dependencies

`yarn`

## Start App

`yarn start`
