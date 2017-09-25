function order(o) {
    o.market    = (typeof o.market !== "undefined") ? o.market : "BTC-BAT";
    o.quantity  = (typeof o.quantity !== "undefined") ? o.quantity : 0;
    
    o.uuid      = null;
    o.filled    = false;
    o.placed    = false;
    o.type      = ''; //buy or sell
    
    
    if (typeof o.if === "undefined")
    {
        o.if = function(rate) { return true; };
    }
    
    o.action = function(amount)
    {

        if (false === o.placed) 
        {
            o.limit_type(amount);
        }

        if (false === o.filled && null !== o.uuid)
        {
            try {
                bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getorder?uuid='+o.uuid, function( data, err ) {
    
//                console.log( data );
//                console.log( "\x1b[91m", err, o, "\x1b[0m"  );
    
                if (null != data)
                {
                    if (false === data.result.IsOpen)
                    {
                        o.filled = true;

                        console.log("\x1b[7m FILLED "+ o.quantity +" "+ o.market+ " FOR "+ data.result.Price +" \x1b[0m");

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
                }, true);
                
                o.filled = null; //prevent double requests and post orders
            }
            catch (e) {
               console.log("\x1b[91m", e, o, "\x1b[0m" );
            }
        }
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

        console.log("\x1b[7m BUYING "+ o.quantity +" "+ o.market+ " FOR "+ bid +" \x1b[0m");
    }
    
    o.sell = function(ask)
    {
        o.type = "sell";

        o.limit(ask);

        console.log("\x1b[7m SELLING "+ o.quantity +" "+ o.market + " FOR "+ ask +" \x1b[0m");
    }
    

    return o;
}

orders = [];

orders.push(order({
    market: "USDT-BTC",
    if: function(rate) { return rate.bat_usdt < 0.19; },
    quantity: 0.00055,
    limit_type: function(bid) { this.buy(bid.usdt_btc.ask); },
    post: function(result) { o = order({ market: "BTC-BAT", limit_type: function(bid) { this.buy(bid.btc_bat.ask); } }); o.quantity = result.Quantity / currency.btc_bat.ask; return o; }
    }));

orders.push(order({
    if: function(rate) { return rate.bat_usdt > 0.22; },
    quantity: 10,
    limit_type: function(ask) { this.sell(ask.btc_bat.bid); },
    post: function(result) { o = order({ market: "USDT-BTC", limit_type: function(ask) { this.sell(ask.usdt_btc.bid); } }); o.quantity = result.Price - result.CommissionPaid; return o; }
    }));

