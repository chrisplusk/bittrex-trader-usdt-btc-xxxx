function order(o) {
    o.market    = o.market ? o.market : "BTC-BAT";
    o.quantity  = o.quantity ? o.quantity : 0;
    
    o.uuid      = null;
    o.filled    = false;
    o.placed    = false;
    o.type      = ''; //buy or sell
    
    o.action = function(amount)
    {
        //if buy on BTC-BAT //too late testing that here
        //add pre-order to buy USDT-BTC //just to keep BTC available?
        
        if (false === o.placed) 
        {
            o.limit_type(amount);
        }

        if (false === o.filled && null !== o.uuid)
        {
            try {
                bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getorder?uuid='+o.uuid, function( data, err ) {
    
//                console.log( data );
//                console.log( err );
    
                if (null != data)
                {
                    if (false === data.result.IsOpen)
                    {
                        o.filled = true;

                        if (data.result.Exchange == "BTC-BAT" && data.result.Type == "LIMIT_SELL")
                        {
                            console.log("\x1b[7m FILLED "+ o.quantity +" "+ o.market+ " FOR "+ data.result.Price +" \x1b[0m");
                            
                            orders.push(order({
                                market: "USDT-BTC",
                                if: function(rate) { return true; },
                                quantity: data.result.Price - data.result.CommissionPaid,
                                limit_type: function(ask) { this.sell(ask.usdt_btc); },
                                }));
                        }
                        if (data.result.Exchange == "USDT-BTC" && data.result.Type == "LIMIT_SELL")
                        {
                            console.log("\x1b[7m FILLED "+ o.quantity +" "+ o.market +" FOR "+ data.result.Price +"\x1b[0m");
                        }
                    }

                }
    
                //handle failed orders (notifications, retries?)
                }, true);
            }
            catch (e) {
               console.log(e);
            }
        }
    }

    o.limit = function limit(rate)
    {
        try {
            bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/market/'+ o.type +'limit?market='+ o.market +'&quantity='+ o.quantity +'&rate='+ rate +'', function( data, err ) {
            ////    { success: true,
            ////      message: '',
            ////      result: { uuid: '  ' } }
//            console.log( data );
            ////    { success: false, message: '  ', result: null }
//            console.log( err );

            if (data != null && true === data.success)
            {
                o.uuid = data.result.uuid;
            }

            }, true );
            
            o.placed = true;
        }
        catch (e) {
//           console.log(e);
        }
    }
    
    o.buy = function buy(bid)
    {
        o.type = "buy";

        o.limit(bid);

        console.log("\x1b[7m BUYING "+ o.quantity +" "+ o.market+ " FOR "+ bid +" \x1b[0m");
    }
    
    o.sell = function sell(ask)
    {
        o.type = "sell";

        o.limit(ask);

        console.log("\x1b[7m SELLING "+ o.quantity +" "+ o.market + " FOR "+ ask +" \x1b[0m");
    }
    

    return o;
}

orders = [];

orders.push(order({
    if: function(rate) { return rate.bat_usdt < 0.19; },
    quantity: 10,
    limit_type: function(bid) { this.buy(bid.btc_bat); },
    }));

orders.push(order({
    if: function(rate) { return rate.bat_usdt > 0.21; },
    quantity: 10,
    limit_type: function(ask) { this.sell(ask.btc_bat); },
    }));

