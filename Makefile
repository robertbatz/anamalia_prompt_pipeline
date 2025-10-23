# Anamalia Prompt Assembler - Build Commands

.PHONY: help install validate assemble render clean test

help: ## Show this help message
	@echo "Anamalia Prompt Assembler - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pip install -r requirements.txt
	npm install

validate: ## Validate all data and schemas
	python scripts/pa.py validate

assemble: ## Assemble prompt bundles from assets
	python scripts/pa.py assemble --characters all --poses all --scenes all

render: ## Render prompt bundles to images
	python scripts/pa.py render --bundles bundles/*.json --out renders/

clean: ## Clean generated files
	rm -rf assets/* bundles/* renders/* logs/*
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

test: ## Run tests
	python -m pytest tests/ -v

dev: ## Start development web viewer
	npm run dev

build: ## Build web viewer for production
	npm run build

serve: ## Serve static web viewer
	npm run serve

all: validate assemble render ## Run full pipeline: validate → assemble → render
