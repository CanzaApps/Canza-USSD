# Canza-USSD

### Before you run the app, you have to run ngrok
 - [Set up or sign in](https://dashboard.ngrok.com/login) into your Ngrok Account
## Connect your account
Running this command will add your authtoken to the default ngrok.yml configuration file. This will grant you access to more features and longer session times. Running tunnels will be listed on the status page of the dashboard.
```
ngrok authtoken [your token]

```
## Start HTTP Tunnel
To start a HTTP tunnel forwarding to your local port 3000, run this next:
```
ngrok http 3000

```
## Install Dependencies
```yarn```
## Start App
```yarn start```

