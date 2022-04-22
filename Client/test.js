const {clientApplication} = require('./client')

let SellerClient = new clientApplication();

SellerClient.generateAndSubmitTxn(
    "seller",
    "Admin",
    "blockchannel",
    "KBA-FInal",
    "PropertyContract",
    "createProperty",
    "property006",
    "4.565, 556.6565",
    "KarakkadLane-Karakkamandapam",
    "3.5 Plot",
    "686544",
    "Trivandrum",
    "Kerala",
    "rtyruu",
    "Anil"       
).then(message => {
    console.log(message.toString());
})