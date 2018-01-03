function currency(c) {
    c.last = 0;
    c.bid = 0;
    c.ask = 0;
    
    c.update = function(delta)
    {
        this.last = delta.Last;
        this.bid = delta.Bid;
        this.ask = delta.Ask;
    }
    
    return c;
}


currencies = {
    collection:     [],
    bat_usdt:       NaN, //keep NaN so orders aren't triggered untill this has a value!
    previous: { bat_usdt:  0, usdt_btc: 0, btc_bat: 0 },
    
    get: function(market) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].market == market)
            {
                return this.collection[i];
            }
        }
    },
    
    update: function()
    {
        if (this.get("USDT-BTC").last * this.get("BTC-BAT").last != 0)
        {
            this.bat_usdt = this.get("BTC-BAT").last * this.get("USDT-BTC").last;
            
            percent = ((this.bat_usdt/this.previous.bat_usdt)-1)*100;

            console.log("// BAT-USDT "+ this.bat_usdt +" USD ("+ Math.round(percent*100)/100 +"%)");
        }
    },
    
    set_previous_bat_usdt: function()
    {
        var calc = this.previous.usdt_btc * this.previous.btc_bat;
        if (calc != 0)
        {
            this.previous.bat_usdt = calc;
        }    
    }
}



bittrex.getmarketsummary( { market : 'BTC-BAT'}, function( data, err ) {
  currencies.previous.btc_bat  = data.result[0].PrevDay;
  currencies.set_previous_bat_usdt();
});
bittrex.getmarketsummary( { market : 'USDT-BTC'}, function( data, err ) {
  currencies.previous.usdt_btc = data.result[0].PrevDay;
  currencies.set_previous_bat_usdt();
});


currencies.collection.push( currency({ market: 'USDT-BTC' }) );
currencies.collection.push( currency({ market: 'BTC-BAT' }) );
// currencies.collection.push( currency({ market: 'USDT-NEO' }) );

currencies.collection.push( currency({ market: 'BTC-ENG' }) );
currencies.collection.push( currency({ market: 'BTC-XLM' }) );

