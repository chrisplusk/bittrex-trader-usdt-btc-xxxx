usdt_btc    = { last: 0, bid: 0, ask: 0 };
btc_bat     = { last: 0, bid: 0, ask: 0 };

bat_usdt    = NaN;
prev_bat_usdt = NaN;

prev_usdt_btc   = 0;
prev_btc_bat    = 0;
set_prev_bat_usdt = function set_prev_bat_usdt()
{
    var calc = prev_usdt_btc * prev_btc_bat;
    if (calc != 0)
    {
        currency.prev_bat_usdt = calc;
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

currency = {
    usdt_btc: usdt_btc,
    btc_bat: btc_bat,
    prev_bat_usdt: prev_bat_usdt,
    bat_usdt: bat_usdt
}