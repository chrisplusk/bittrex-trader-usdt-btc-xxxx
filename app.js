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


usdt_btc    = 0;
btc_bat     = 0;
prev_usdt_btc   = 0;
prev_btc_bat    = 0;

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
    if: function(val) { return val < 0.19; },
    amount: 100,
    action: function(o) { if (false === o.placed) return buy(o); else return ''; },
    placed: false,
    output: ''
    });
orders.push({
    if: function(val) { return val > 0.21; },
    amount: 100,
    action: function(o) { if (false === o.placed) return sell(o); else return ''; },
    placed: false,
    output: ''
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
                prev_usdt_btc = marketsDelta.PrevDay;
            }
            if (marketsDelta.MarketName == "BTC-BAT") 
            {
                btc_bat = marketsDelta.Last;
                prev_btc_bat = marketsDelta.PrevDay;
            }
            
            if (prev_usdt_btc * prev_btc_bat != 0)
            {
                prev_bat_usdt = prev_usdt_btc * prev_btc_bat;
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