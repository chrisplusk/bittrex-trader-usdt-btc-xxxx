require('dotenv').config();
var express = require('express');
var request = require('request');
var querystring = require('querystring');
var mysql  = require('mysql');
bittrex = require('node-bittrex-api');

var app = express();

app.use(express.static(__dirname + '/public'));


var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'bittrex',
    password : process.env.BITTREX_MYSQL_PASSWORD,
    database : 'bittrex',
    dateStrings: true
  });
  
  connection.connect();

var PushBullet = require('pushbullet');
var pusher = new PushBullet(process.env.PUSHBULLET_KEY);

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
  'apikey' : process.env.API_KEY,
  'apisecret' : process.env.API_SECRET, 
  'verbose' : true
});

SAT_INT_MULTIPLIER = 100000000;

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


console.log('Listening on 8080');
app.listen(8080);

app.get('/getTicks', function(req, res) {

    var market  = req.query.market;
    var date    = req.query.date;

    if (null == currencies.get(market))
    {
        res.send();
        return false;
    }

    // if (date) //invalid
    // {
    //     res.send();
    //     return false;
    // }

    connection.query('SELECT date, market, last, bid, ask FROM ticks WHERE market = ? AND date > ? ORDER BY date ASC',
        [ market, date ],
        function (error, results, fields) {
            if (error) throw error;
// console.log(this.sql);
        res.send({
            'ticks' : results
        });
        
    });

});


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

                        var tick = {
                            date: marketsDelta.TimeStamp,
                            market: marketsDelta.MarketName,
                            last: marketsDelta.Last * SAT_INT_MULTIPLIER,
                            bid: marketsDelta.Bid * SAT_INT_MULTIPLIER,
                            ask: marketsDelta.Ask * SAT_INT_MULTIPLIER,
                          }
                          connection.query('INSERT INTO ticks SET ?', tick, function (error, results, fields) {
                            if (error) throw error;
                          });

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

