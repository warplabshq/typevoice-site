# typevoice.ai is a Cloudflare Pages project (direct upload, no build step).
# `make deploy` publishes the working tree; run it after every change you want live.
.PHONY: deploy preview
deploy:
	npx --yes wrangler pages deploy . --project-name typevoice --branch main --commit-dirty=false
preview:
	python3 -m http.server 8787
