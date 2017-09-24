var express = require('express');
var request = require('request');
var querystring = require('querystring');
var bittrex = require('node.bittrex.api');

require('./keys.js');

var app = express();

bittrex.options({
  'apikey' : API_KEY,
  'apisecret' : API_SECRET, 
});

//data = {market : 'USDT-BTC'};
//var websocketsclient = bittrex.websockets.subscribe(['USDT-BTC','BTC-BAT'], function(data) {
//  if (data.M === 'updateExchangeState') {
//    data.A.forEach(function(data_for) {
//      console.log('Market Update for '+ data_for.MarketName, data_for);
//    });
//  }
//});

//bittrex.getbalances( function( data, err ) {
//  console.log( data );
//});

prev_usdt_btc   = 0;
prev_btc_bat    = 0;
set_prev_bat_usdt = function set_prev_bat_usdt()
{
    var calc = prev_usdt_btc * prev_btc_bat;
    if (calc != 0)
    {
        prev_bat_usdt = calc;
    }    
}
bittrex.getmarketsummary( { market : 'BTC-BAT'}, function( data, err ) {
  prev_btc_bat  = data.result[0].PrevDay;
  set_prev_bat_usdt();
});
bittrex.getmarketsummary( { market : 'USDT-BTC'}, function( data, err ) {
  prev_usdt_btc = data.result[0].PrevDay;
  set_prev_bat_usdt();
});


usdt_btc    = 0;
btc_bat     = 0;

bat_usdt    = NaN;
prev_bat_usdt = NaN;

buy = function buy(order)
{
    order.placed = true;
    return "BUYING "+ order.amount
}
sell = function sell(order)
{
    order.placed = true;
    return "SELLING "+ order.amount
}


orders = [];
orders.push({
    if: function(rate) { return rate < 0.207; },
    quantity: 100,
    action: function(o) { return (false === o.placed) ? buy(o) : ''; },
    placed: false
    });
orders.push({
    if: function(rate) { return rate > 0.209; },
    quantity: 100,
    action: function(o) { return (false === o.placed) ? sell(o) : ''; },
    placed: false
    });

var websocketsclient = bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        if (marketsDelta.MarketName == "USDT-BTC" || marketsDelta.MarketName == "BTC-BAT")
        {
            var summary = marketsDelta.TimeStamp +" "+ marketsDelta.MarketName +" : "+ marketsDelta.Last +" "+ marketsDelta.Bid +" "+ marketsDelta.Ask;
            
            actions = "";
            
            if (marketsDelta.MarketName == "USDT-BTC") 
            {
                usdt_btc = marketsDelta.Last;
            }
            if (marketsDelta.MarketName == "BTC-BAT") 
            {
                btc_bat = marketsDelta.Last;
            }
            
            if (usdt_btc * btc_bat != 0)
            {
                bat_usdt = btc_bat * usdt_btc;
                
                orders.forEach(function(order) {
                    if (order.if(bat_usdt))
                    {
                        actions += order.action(order);
                    }
                });
            }
            
            percent = ((bat_usdt/prev_bat_usdt)-1)*100;
            
            console.log(summary, "// BAT-USDT "+ bat_usdt +" USD ("+ Math.round(percent*100)/100 +"%)", actions);
        }
      });
    });
  }
});

//console.log('Listening on ' + 8080);
//app.listen(8080);