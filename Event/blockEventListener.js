const { EventListener } = require('./event')

let SellerEvent = new EventListener();
SellerEvent.blockEventListener("seller", "Admin", "blockchannel");

//let BuyerEvent = new EventListener();
//BuyerEvent.blockEventListener("buyer", "Admin", "blockchannel");

//let LandinspectorEvent = new EventListener(); 
//LandinspectorEvent.blockEventListener("landinspector", "Admin", "blockchannel");
