.PHONY: install build check lint format help

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies (smritea-sdk + devDeps)
	npm install

build: install ## Bundle scripts/context-hook.js + deps into scripts/dist/context-hook.js
	npm run build

check: ## Syntax-check source scripts via node --check (no deps required)
	node --check scripts/context-hook.js
	node --check scripts/lib/settings.js
	node --check scripts/lib/format-context.js

lint: build ## Lint JavaScript source with ESLint
	npx eslint scripts/

format: build ## Auto-fix JavaScript source with ESLint (--fix)
	npx eslint scripts/ --fix
