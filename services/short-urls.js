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
        const sourceURL = `https://alfajores-blockscout.celo-testnet.org/tx/${txid}/token-transfers`
        resolve(tinyURL.shorten(sourceURL))
    })
}

// wallet address shortURL
const getUserAddressUrl = (userAddress) => {
    return new Promise((resolve) => {
        const sourceURL = `https://alfajores-blockscout.celo-testnet.org/address/${userAddress}/`
        resolve(tinyURL.shorten(sourceURL))
    })
}

module.exports = { getTxIdUrl, getUserAddressUrl, getDeepLinkUrl}