// www.typevoice.ai → typevoice.ai, permanently, before anything else runs. Search engines treat the
// two hosts as separate sites otherwise (a duplicate copy of every page).
// Pages from the domain's previous owner still sit in Google's index; 410 tells it they're gone for good.
const GONE = [/^\/templates\//, /^\/guides\/how-to-assess-appointment-setters\/?$/];
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "www.typevoice.ai") {
    url.hostname = "typevoice.ai";
    return Response.redirect(url.toString(), 301);
  }
  if (GONE.some((re) => re.test(url.pathname))) return new Response("Gone", { status: 410, headers: { "content-type": "text/plain", "x-robots-tag": "noindex" } });
  return next();
}
