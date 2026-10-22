// GET /geo — the price for the visitor's country, so the page can say "₹599 in India".
// Cloudflare tells us the country of the request (never stored). The table below mirrors the
// Localized Pricing rules on both Dodo products (`/products/{id}/localized-prices`, by_country):
// change one, change the other. Everyone else pays the list price, converted at checkout.
const PRICES = {
  IN: { currency: "INR", personal: 599, team: 2399, tax: "GST" },
};

export function onRequestGet({ request }) {
  const url = new URL(request.url);
  // ?c=IN previews another country (for checking the page); real visits use Cloudflare's answer.
  const country = (url.searchParams.get("c") || request.cf?.country || "").toUpperCase();
  const body = PRICES[country] ? { country, ...PRICES[country] } : { country };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
