// GET /geo — what a visitor's country pays, so the page can say "about ₹2,400 in India".
// Cloudflare tells us the country of the request (never stored); Dodo applies the same
// percentages at checkout, by billing country. Nothing here is personal data.
//
// PCT mirrors Dodo's default Purchasing Power Parity table: the World Bank price level index
// (PA.NUS.GDP.PLI, 2024), rounded to 5, floored at 30, capped at 100 (docs.dodopayments.com/
// features/purchasing-power-parity). Countries missing here pay 100%. If the percentages are
// ever edited in the Dodo dashboard (Business Settings › Country Prices), edit them here too.
const PCT = {AD:65,AE:65,AF:30,AG:70,AL:45,AM:35,AO:30,AR:45,AT:75,AU:90,AW:75,AZ:30,BA:35,BD:30,BE:75,BF:35,BG:40,BH:45,BI:30,BJ:35,BN:35,BO:35,BR:45,BS:95,BT:30,BW:35,BY:30,BZ:55,CA:85,CD:40,CF:40,CG:35,CI:35,CL:45,CM:35,CN:50,CO:35,CR:60,CV:45,CW:70,CY:60,CZ:55,DE:75,DJ:45,DK:90,DM:50,DO:40,DZ:35,EC:45,EE:60,EG:30,ES:60,ET:35,FI:80,FJ:40,FM:95,FO:90,FR:75,GA:40,GB:85,GD:60,GE:35,GH:30,GM:30,GN:35,GQ:40,GR:55,GT:45,GW:30,GY:35,HK:70,HN:45,HR:50,HT:65,HU:50,ID:30,IE:80,IL:95,IN:30,IQ:40,IR:30,IT:65,JM:60,JO:45,JP:60,KE:30,KG:30,KH:35,KI:70,KM:45,KN:70,KR:60,KW:60,KZ:35,LA:30,LB:40,LC:50,LK:30,LR:45,LS:35,LT:55,LU:90,LV:55,LY:45,MA:40,MD:40,ME:40,MG:30,MH:90,MK:35,ML:35,MM:30,MN:35,MO:55,MR:30,MT:65,MU:40,MV:50,MW:30,MX:55,MY:30,MZ:40,NA:40,NE:35,NG:30,NI:35,NL:80,NO:85,NP:30,NZ:90,OM:50,PA:45,PE:50,PG:60,PH:35,PK:30,PL:50,PR:80,PS:65,PT:55,PW:85,PY:35,QA:60,RO:40,RS:40,RU:30,RW:30,SA:50,SB:70,SC:55,SD:45,SE:80,SG:60,SI:60,SK:55,SL:30,SN:35,SO:40,SR:30,ST:55,SV:40,SX:75,SZ:35,TD:35,TG:35,TH:30,TJ:30,TL:30,TM:30,TN:30,TO:75,TR:35,TT:50,TV:90,TZ:30,UA:30,UG:35,UY:65,UZ:30,VC:55,VN:30,VU:90,WS:60,XK:40,ZA:40,ZM:30,ZW:40};

// Currencies the ECB publishes (api.frankfurter.dev); other countries get the USD figure.
const CUR = {
  IN: "INR", BR: "BRL", JP: "JPY", GB: "GBP", PH: "PHP", ZA: "ZAR", ID: "IDR", MX: "MXN", TR: "TRY",
  KR: "KRW", MY: "MYR", TH: "THB", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN", CN: "CNY",
  HK: "HKD", SG: "SGD", IL: "ILS", CA: "CAD", AU: "AUD", NZ: "NZD", CH: "CHF", SE: "SEK", NO: "NOK",
  DK: "DKK", IS: "ISK",
  AT: "EUR", BE: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR", DE: "EUR", GR: "EUR", IE: "EUR",
  IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR",
  ES: "EUR", HR: "EUR",
};

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  // ?c=IN previews another country (for checking the page); real visits use Cloudflare's answer.
  const country = (url.searchParams.get("c") || request.cf?.country || "").toUpperCase();
  const pct = PCT[country] || 100;
  const body = { country, pct, currency: "USD", rate: 1 };
  if (pct < 100 && CUR[country] && CUR[country] !== "USD") {
    try {
      const r = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=" + CUR[country],
                            { cf: { cacheTtl: 43200, cacheEverything: true } });
      const fx = await r.json();
      const rate = fx && fx.rates && fx.rates[CUR[country]];
      if (rate > 0) { body.currency = CUR[country]; body.rate = rate; }
    } catch (_) { /* the USD figure is still right */ }
  }
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "private, max-age=3600" },
  });
}
