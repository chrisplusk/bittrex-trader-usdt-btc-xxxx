var express = require('express');
var request = require('request');
var querystring = require('querystring');
bittrex = require('node-bittrex-api');

require('./keys.js');

var app = express();

var PushBullet = require('pushbullet');
var pusher = new PushBullet(PUSHBULLET_KEY);

pusher_devices = [];

pusher.devices(function(error, response) {
    response.devices.forEach(function(dev) {
        pusher_devices.push(dev.iden);
    });
});

push = function(msg)
{
    console.log("\x1b[7m "+ msg +" \x1b[0m");
    
    pusher_devices.forEach(function(iden) { pusher.note(iden,'bittrex-trader-usdt-btc-xxxx',msg,function(error, response) {}); } );
}

bittrex.options({
  'apikey' : API_KEY,
  'apisecret' : API_SECRET, 
  'verbose' : true
});

//bittrex.getbalance({ currency : 'BAT' }, function( data, err ) {
//  console.log( data );
//});
//bittrex.getbalance({ currency : 'USDT' }, function( data, err ) {
//  console.log( data );
//});

/*
    TODO:
    
    grid, realtime graphs? , timeout detector

    disconnect/reconnect stuff

    generalize for BTC-XXXX markets
    
    conditional order ? to buy < or sell > if target
    trailing stop order : cancel function?

    notify x% drop vs 24hr high
        @ %+/-
        //notify > create buy > create sell (set amount, no duplicates)

    
    

    
    Stategy: incl transaction + btc transfer costs
    
*/

require('./currencies.js');

require('./orders.js');

var websocketsclient = bittrex.websockets.listen( function( data ) {
    if (data.M === 'updateSummaryState') {
        data.A.forEach(function(data_for) {
            data_for.Deltas.forEach(function(marketsDelta) {
                
                orders.forEach(function(order) {
                    
                    if (order.market == marketsDelta.MarketName)
                    {
                        console.log( marketsDelta.TimeStamp +" "+ marketsDelta.MarketName +" : "+ marketsDelta.Last +" "+ marketsDelta.Bid +" "+ marketsDelta.Ask );

                        currencies.get(marketsDelta.MarketName).update( marketsDelta );

                        order.action();
                    }
                    
                });

            });
        });
        
        currencies.update();
        
    }
});

/**
 *  all possible serviceHandlers:
 *  
 *  bound: function() { console.log("Websocket bound"); },
 *  connectFailed: function(error) { console.log("Websocket connectFailed: ", error); },
 *  connected: function(connection) { console.log("Websocket connected"); },
 *  disconnected: function() { console.log("Websocket disconnected"); },
 *  onerror: function (error) { console.log("Websocket onerror: ", error); },
 *  messageReceived: function (message) { console.log("Websocket messageReceived: ", message); return false; },
 *  bindingError: function (error) { console.log("Websocket bindingError: ", error); },
 *  connectionLost: function (error) { console.log("Connection Lost: ", error); },
 *  reconnecting: function (retry { inital: true/false, count: 0} ) {
 *      console.log("Websocket Retrying: ", retry);
 *      //return retry.count >= 3; // cancel retry true
 *      return true;
 *  }
 */


// websocketsclient.serviceHandlers.onerror = function (error) {
//   console.log('some error occured', error);
// }
// websocketsclient.serviceHandlers.connectFailed = function(error) {
//     console.log("Websocket connectFailed: ", error);
// }
// websocketsclient.serviceHandlers.disconnected = function() {
//     console.log("Websocket disconnected");
// }
// websocketsclient.serviceHandlers.bindingError = function (error) {
//     console.log("Websocket bindingError: ", error);
// }
// websocketsclient.serviceHandlers.connectionLost = function (error) {
//     console.log("Connection Lost: ", error);
// }
// websocketsclient.serviceHandlers.reconnecting = function (retry) { //retry {inital: true/false, count: 0} 
//     console.log("Websocket Retrying: ", retry);
//     //return retry.count >= 3; // cancel retry true
//     return false;
// }

