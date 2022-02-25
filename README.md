# Canza-USSD

## Before you run the app, you have to run ngrok

- [Set up or sign in](https://dashboard.ngrok.com/login) into your Ngrok Account

## Dotenv variables

- port connection
1. PORT=8000

- db connection
1. DEV_MONGO_URI='replace with local Mongodb'
2. PRO_MONGO_URI='replace with online Mongodb

- celo blockchain connection
1. TEST_NET_ALFAJORES=https://alfajores-forno.celo-testnet.org
2. MAIN_NET_ALFAJORES=https://forno.celo.org

- crypto
1. SECRET_KEY_HASH=sha256

- africa's talking api
1. AT_API_KEY=b2db2b9ff7e9098dc558cb21f9d75b5ed39900aac18eda40aa8acb1e62c7959c
2. AT_API_USERNAME=sandbox
   
3. AT_API_KEY=
4. AT_API_USERNAME=


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
