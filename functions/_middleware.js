// www.typevoice.ai → typevoice.ai, permanently, before anything else runs. Search engines treat the
// two hosts as separate sites otherwise (a duplicate copy of every page).
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "www.typevoice.ai") {
    url.hostname = "typevoice.ai";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
