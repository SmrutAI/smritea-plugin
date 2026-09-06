.PHONY: install build check lint format smoke help

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

smoke: ## Smoke-test the marketplace-shipped plugin (bundle freshness + hook runs from staged copy)
	# Strip the relative GIT_DIR/GIT_INDEX_FILE that `git commit` exports to hooks:
	# when this repo is mounted as a submodule, .git is a gitlink FILE and those
	# variables break the script's `git -C` freshness check ("Not a directory").
	env -u GIT_DIR -u GIT_INDEX_FILE -u GIT_WORK_TREE bash scripts/smoke-publish.sh
