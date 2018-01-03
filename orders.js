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
    
    if (typeof o.calc === "undefined")
    {
        o.calc = function() {};
    }
    
    o.action = function()
    {
        if (o.if() && false === o.placed) 
        {
            o.calc();
            o.place();
        }
        
        if (false === o.filled && null !== o.uuid)
        {
            try {
                bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getorder?uuid='+o.uuid, function( data, err ) { o.fill( data, err ); }, true);
                
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
        else
        {
            //handle failed orders (notifications, retries?)
        }
    }
    
    o.limit = function(rate)
    {
        try {
            bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/market/'+ o.type +'limit?market='+ o.market +'&quantity='+ o.quantity.toPrecision(8) +'&rate='+ rate +'', function( data, err ) {
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
    
    o.balance = function(get)
    {
        if (o.quantity == 0) 
        {
            bittrex.getbalance({ currency : get }, function( data, err ) { 
                o.quantity = data.result.Available;
            });
        }
    }
    
    
    return o;
}

orders = [];

// orders.push({
//     market: 'USDT-NEO',
    
//     order: {
//         buy: function() {
//             return order({
//                 market: "USDT-NEO",
//                 if: function() {  return false; /*return this.currency.ask < 30;*/  },
//                 calc: function() { this.quantity = 100 / this.currency.ask; },
//                 place: function() { this.buy(this.currency.ask); },
//                 });
//             },
//         sell: function() {
//             return order({
//                 market: "USDT-NEO",
//                 if: function() {  return false; /*return this.currency.bid > 33;*/  },
//                 calc: function() { this.balance('NEO'); },
//                 place: function() { this.sell(this.currency.bid); },
//                 });
//            },
//     },
    
//     action: function()
//     {
//         //if * orders.push(this.order.buy())
//         //if * orders.push(this.order.sell())
//     }
// });


// orders.push(order({
//     market: "USDT-BTC",
//     if: function() { return false;  /*return currencies.bat_usdt < 0.25;*/  },
//     calc: function() { this.quantity = 100 / this.currency.ask; },
//     place: function() { this.buy(this.currency.ask); },
//     post: function(result) { o = order({ market: "BTC-BAT", place: function() { this.buy(this.currency.ask); } }); console.log(result); o.quantity = result.Quantity / o.currency.ask; return o; }
//     }));

// orders.push(order({
//     market: "BTC-BAT",
//     if: function() { /* return false; */ return currencies.bat_usdt > 0.27; },
//     calc: function() { this.balance('BAT'); },
//     place: function() { if (this.quantity != 0 ) { this.sell(this.currency.bid); } },
//     post: function(result) { o = order({ market: "USDT-BTC", place: function() { this.sell(this.currency.bid); } }); o.quantity = result.Price - result.CommissionPaid; return o; }
//     }));

// //replace with new ath / 24h high
// orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt > this.quantity; }, quantity: 0.26, place: function() { push( "BAT PEAK > $"+ this.quantity ); this.placed = true; }, }));
// orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt > this.quantity; }, quantity: 0.27, place: function() { push( "BAT PEAK > $"+ this.quantity ); this.placed = true; }, }));

// orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.23, place: function() { push( "BAT DIP < $"+ this.quantity ); this.placed = true; }, }));
// orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.24, place: function() { push( "BAT DIP < $"+ this.quantity ); this.placed = true; }, }));
orders.push(order({ market: "BTC-BAT", if: function() { return currencies.bat_usdt < this.quantity; }, quantity: 0.25, place: function() { push( "BAT DIP < $"+ this.quantity ); this.placed = true; }, }));

orders.push(order({ market: "BTC-XLM", if: function() { return currencies.ask < this.quantity; }, quantity: 0.00005550, place: function() { push( "XLM DIP < "+ this.quantity+"sat" ); this.placed = true; }, }));

orders.push(order({ market: "BTC-ENG", if: function() { return currencies.ask > this.quantity; }, quantity: 0.00049000, place: function() { push( "ENG PEAK > "+ this.quantity+"sat" ); this.placed = true; }, }));

