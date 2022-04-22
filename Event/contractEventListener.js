const { EventListener } = require('./event')

let SellerEvent = new EventListener();
SellerEvent.contractEventListener("seller", "Admin", "blockchannel",
    "KBA-FInal", "PropertyContract", "addPropertyEvent");