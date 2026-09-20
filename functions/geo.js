// GET /geo — the price for the visitor's country, so the page can say "₹2,499 in India".
// Cloudflare tells us the country of the request (never stored). The table below mirrors the
// Localized Pricing rules on both Dodo products (`/products/{id}/localized-prices`, by_country):
// change one, change the other. Everyone else pays the list price, converted at checkout.
const PRICES = {
  IN: { currency: "INR", personal: 2499, team: 9499, tax: "GST" },
  PK: { currency: "USD", personal: 24, team: 89, tax: "tax" },
  BD: { currency: "USD", personal: 24, team: 89, tax: "tax" },
  EG: { currency: "USD", personal: 24, team: 89, tax: "tax" },
  NG: { currency: "USD", personal: 24, team: 89, tax: "tax" },
};

export function onRequestGet({ request }) {
  const url = new URL(request.url);
  // ?c=IN previews another country (for checking the page); real visits use Cloudflare's answer.
  const country = (url.searchParams.get("c") || request.cf?.country || "").toUpperCase();
  const body = PRICES[country] ? { country, ...PRICES[country] } : { country };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "private, max-age=3600" },
  });
}
