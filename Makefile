# Variables
DC := docker-compose
DC_LOCAL := $(DC) -f docker-compose-local.yml
DC_DEV := $(DC) -f docker-compose-dev.yml
DC_PROD := $(DC) -f docker-compose.yml
NPM := npm

# Local development commands
local-up:
	$(DC_LOCAL) up -d

local-down:
	$(DC_LOCAL) down

local-logs:
	$(DC_LOCAL) logs -f

local-ps:
	$(DC_LOCAL) ps

# Development commands
dev-build:
	$(DC_DEV) build

dev-up:
	$(DC_DEV) up -d

dev-down:
	$(DC_DEV) down

dev-logs:
	$(DC_DEV) logs -f

dev-ps:
	$(DC_DEV) ps

# Production commands
prod-up:
	$(DC_PROD) up -d

prod-down:
	$(DC_PROD) down

prod-logs:
	$(DC_PROD) logs -f

prod-ps:
	$(DC_PROD) ps

# Database migrations
migrate-dev:
	$(DC_LOCAL) exec api npm run prisma:migrate:dev

migrate-prod:
	$(DC_PROD) exec api npm run prisma:migrate:deploy

# Application commands
install:
	$(NPM) install

build:
	$(NPM) run build

start:
	$(NPM) run start

start-dev:
	$(NPM) run start:dev

# Utility commands
clean:
	rm -rf dist node_modules

# Help command
help:
	@echo "Available commands:"
	@echo "  local-up          Start local development environment"
	@echo "  local-down        Stop local development environment"
	@echo "  local-logs        View local development logs"
	@echo "  local-ps          List local development containers"
	@echo "  dev-up            Start development environment"
	@echo "  dev-down          Stop development environment"
	@echo "  dev-logs          View development logs"
	@echo "  dev-ps            List development containers"
	@echo "  prod-up           Start production environment"
	@echo "  prod-down         Stop production environment"
	@echo "  prod-logs         View production logs"
	@echo "  prod-ps           List production containers"
	@echo "  migrate-dev       Run development database migrations"
	@echo "  migrate-prod      Run production database migrations"
	@echo "  install           Install dependencies"
	@echo "  build             Build the application"
	@echo "  start             Start the application"
	@echo "  start-dev         Start the application in development mode"
	@echo "  clean             Remove build artifacts and dependencies"
	@echo "  help              Show this help message"

.PHONY: local-up local-down local-logs local-ps dev-up dev-down dev-logs dev-ps \
        prod-up prod-down prod-logs prod-ps migrate-dev migrate-prod \
        install build start start-dev clean help
