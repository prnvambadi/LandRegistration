const {clientApplication} = require('./client')

let BuyerClient = new clientApplication()

BuyerClient.generateAndEvaluateTxn(
    "seller",
    "Admin",
    "blockchannel",
    "KBA-FInal",
    "PropertyContract",
    "readProperty",
    "property001"
).then(message => {
    console.log(message.toString())
})
