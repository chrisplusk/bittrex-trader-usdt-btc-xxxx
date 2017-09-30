function order(o) {
    o.market    = (typeof o.market !== "undefined") ? o.market : "BTC-BAT";
    o.quantity  = (typeof o.quantity !== "undefined") ? o.quantity : 0;
    
    o.currency  = currencies.get(o.market), 
    
    o.uuid      = null;
    o.filled    = false;
    o.placed    = false;
    o.type      = ''; //buy or sell
    
    
    if (typeof o.if === "undefined")
    {
        o.if = function(rate) { return true; };
    }
    
    o.action = function()
    {
        if (o.if() && false === o.placed) 
        {
            o.place();
        }
        
        if (false === o.filled && null !== o.uuid)
        {
            try {
                bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getorder?uuid='+o.uuid, o.fill(data, err), true);
                
                o.filled = null; //prevent double requests and post orders
            }
            catch (e) {
               console.log("\x1b[91m", e, o, "\x1b[0m" );
            }
        }
    }

    o.fill = function( data, err )
    {
    
//        console.log( data );
//        console.log( "\x1b[91m", err, o, "\x1b[0m"  );

        if (null != data)
        {
            if (false === data.result.IsOpen)
            {
                o.filled = true;

                push( "FILLED "+ o.quantity +" "+ o.market+ " FOR "+ data.result.Price );

                if (typeof o.post === "function")
                {
                    orders.push(o.post(data.result));
                }

            }
            else
            {
                o.filled = false;
            }

        }

        //handle failed orders (notifications, retries?)
    }
    
    o.limit = function(rate)
    {
        try {
            bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/market/'+ o.type +'limit?market='+ o.market +'&quantity='+ o.quantity +'&rate='+ rate +'', function( data, err ) {
            ////    { success: true,
            ////      message: '',
            ////      result: { uuid: '  ' } }
//            console.log( data );
            ////    { success: false, message: '  ', result: null }
            if (data === null)
            {
                console.log( "\x1b[91m", err, o, "\x1b[0m" );
            }

            if (data != null && true === data.success)
            {
                o.uuid = data.result.uuid;
            }

            }, true );
            
            o.placed = true;
        }
        catch (e) {
           console.log("\x1b[91m", e, o, "\x1b[0m" );
        }
    }
    
    o.buy = function(bid)
    {
        o.type = "buy";

        o.limit(bid);

        push( "BUYING "+ o.quantity +" "+ o.market+ " FOR "+ bid );
    }
    
    o.sell = function(ask)
    {
        o.type = "sell";

        o.limit(ask);

        push( "SELLING "+ o.quantity +" "+ o.market + " FOR "+ ask );
    }
    return o;
}

orders = [];

orders.push(order({
    market: "USDT-BTC",
    if: function() { return false; /*currencies.bat_usdt < 0.19;*/ },
    quantity: 0.00000, //calc for $100 worth
    place: function() { this.buy(this.currency.ask); },
    post: function(result) { o = order({ market: "BTC-BAT", place: function() { this.buy(this.currency.ask); } }); o.quantity = result.Quantity / this.currency.ask; return o; }
    }));

orders.push(order({
    market: "BTC-BAT",
    if: function() { return false; /* currencies.bat_usdt > 0.245 || this.currency.bid > 0.00006;*/ },
    quantity: 0, //func for all? check balance?
    place: function() { this.sell(this.currency.bid); },
    post: function(result) { o = order({ market: "USDT-BTC", place: function() { this.sell(this.currency.bid); } }); o.quantity = result.Price - result.CommissionPaid; return o; }
    }));


//replace with new ath / 24h high
orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt > this.quantity; }, quantity: 0.26, place: function() { push( "BAT PEAK > $"+ this.quantity ); }, }));

orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.235, place: function() { push( "BAT DIP < $"+ this.quantity ); }, }));
orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.225, place: function() { push( "BAT DIP < $"+ this.quantity ); }, }));
orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.215, place: function() { push( "BAT DIP < $"+ this.quantity ); }, }));
orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.205, place: function() { push( "BAT DIP < $"+ this.quantity ); }, }));

