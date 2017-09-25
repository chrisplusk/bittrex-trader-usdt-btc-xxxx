var express = require('express');
var request = require('request');
var querystring = require('querystring');
bittrex = require('node.bittrex.api');

require('./keys.js');

var app = express();

bittrex.options({
  'apikey' : API_KEY,
  'apisecret' : API_SECRET, 
});

//bittrex.getbalance({ currency : 'BAT' }, function( data, err ) {
//  console.log( data );
//});
//bittrex.getbalance({ currency : 'USDT' }, function( data, err ) {
//  console.log( data );
//});


require('./currencies.js');

require('./orders.js');

var websocketsclient = bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        if (marketsDelta.MarketName == "USDT-BTC" || marketsDelta.MarketName == "BTC-BAT")
        {
            var summary = marketsDelta.TimeStamp +" "+ marketsDelta.MarketName +" : "+ marketsDelta.Last +" "+ marketsDelta.Bid +" "+ marketsDelta.Ask;
            
            if (marketsDelta.MarketName == "USDT-BTC") 
            {
                currency.usdt_btc.last = marketsDelta.Last;
                currency.usdt_btc.bid = marketsDelta.Bid;
                currency.usdt_btc.ask = marketsDelta.Ask;
            }
            if (marketsDelta.MarketName == "BTC-BAT") 
            {
                currency.btc_bat.last = marketsDelta.Last;
                currency.btc_bat.bid = marketsDelta.Bid;
                currency.btc_bat.ask = marketsDelta.Ask;
            }
            
            if (currency.usdt_btc.last * currency.btc_bat.last != 0)
            {
                currency.bat_usdt = currency.btc_bat.last * currency.usdt_btc.last;
                
                orders.forEach(function(order) {
                    if (order.if(currency))
                    {
                        order.action(currency);
                    }
                });
            }
            
            percent = ((currency.bat_usdt/currency.prev_bat_usdt)-1)*100;
            
            console.log(summary, "// BAT-USDT "+ currency.bat_usdt +" USD ("+ Math.round(percent*100)/100 +"%)");
            
        }
      });
    });
  }
});




