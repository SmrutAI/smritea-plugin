.PHONY: install check lint format help

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies (smritea-sdk + devDeps)
	npm install

check: ## Syntax-check all scripts via node --check (no deps required)
	node --check scripts/context-hook.js
	node --check scripts/lib/settings.js
	node --check scripts/lib/format-context.js

lint: ## Lint JavaScript with ESLint
	npm install --silent
	npx eslint scripts/

format: ## Auto-fix JavaScript with ESLint (--fix)
	npm install --silent
	npx eslint scripts/ --fix
