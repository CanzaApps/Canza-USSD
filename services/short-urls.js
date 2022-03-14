const tinyURL = require('tinyurl')

// short urls
const getTxIdUrl = async (txid) => {
    return await getSentTxidUrl(txid)
} 

// deep links
const getDeepLinkUrl = (deeplink)=> {
    return new Promise(resolve => {
        const sourceURL = deeplink
        resolve(tinyURL.shorten(sourceURL))
    })
}

const getSentTxidUrl = (txid) => {
    return new Promise(resolve => {
        const sourceURL = `https://explorer.celo.org/tx/${txid}/token-transfers`
        resolve(tinyURL.shorten(sourceURL))
    })
}

// wallet address shortURL
// https://explorer.celo.org
// https://alfajores-blockscout.celo-testnet.org
const getUserAddressUrl = (userAddress) => {
    return new Promise((resolve) => {
        const sourceURL = `https://explorer.celo.org/address/${userAddress}/`
        resolve(tinyURL.shorten(sourceURL))
    })
}

module.exports = { getTxIdUrl, getUserAddressUrl, getDeepLinkUrl}