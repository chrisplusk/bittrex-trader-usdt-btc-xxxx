function order(o) {
    o.market    = "BTC-BAT";
    o.quantity  = o.quantity ? o.quantity : 0;
    o.uuid      = null;
    o.filled    = false;
    o.message   = '';
    o.type      = ''; //buy or sell
    
    o.action = function(amount) {
        
        if (null === o.uuid) 
        {
            o.limit_type(amount)
        }
        
        //check = function check(order)
//{
//    if (order.filled === false && order.uuid !== null)
//    {
//        bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getorder&uuid='+uuid, function( data, err ) {
//
//            console.log( data );
//            console.log( err );
//
//            if (false === data.result.IsOpen)
//            {
//                order.filled = true;
//            }
//            else
//            {
//                //if buy on BTC-BAT
//                    //add pre-order to buy USDT-BTC //just to keep BTC available?
//
//                //if sell on BTC-BAT
//                    //add order to sell USDT-BTC
//                    //if USDT-BTC is filled order.secured = true;
//                
//            }
//
//            //handle failed orders (notifications, retries?)
//            }, true);
//    }
//}
    }

    o.limit = function limit(rate)
    {
        try {
            bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/market/'+ o.type +'limit?market='+ o.market +'&quantity='+ o.quantity +'&rate='+ rate +'', function( data, err ) {
            ////    { success: true,
            ////      message: '',
            ////      result: { uuid: '  ' } }
            console.log( data );
            ////    { success: false, message: '  ', result: null }
            console.log( err );

            if (data != null && data.success === true)
            {
                o.uuid = data.result.uuid;
            }

            }, true );
        }
        catch (e) {
           console.log(e);
        }
    }
    
    o.buy = function buy(bid)
    {
        o.type = "buy";

        o.limit(bid);

        o.message = "\x1b[36m BUYING "+ o.quantity + " \x1b[0m";
    }
    
    o.sell = function sell(ask)
    {
        o.type = "sell";

        o.limit(ask);

        o.message = "\x1b[36m SELLING "+ o.quantity + " \x1b[0m";
    }
    

    return o;
}

orders = [];

orders.push(order({
    if: function(rate) { return rate < 0.19; },
    quantity: 10,
    limit_type: function(bid) { this.buy(bid); },
    }));

orders.push(order({
    if: function(rate) { return rate > 0.21; },
    quantity: 10,
    limit_type: function(ask) { this.sell(ask); },
    }));

