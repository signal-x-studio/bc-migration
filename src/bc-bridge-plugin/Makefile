# BC Bridge Plugin Makefile
#
# Build, test, and deploy commands for the BC Bridge WordPress plugin.

.PHONY: all build clean install lint test zip deploy help

# Variables
PLUGIN_NAME := bc-bridge
PLUGIN_VERSION := $(shell grep "Version:" bc-bridge.php | sed 's/.*Version: //')
BUILD_DIR := build
DIST_DIR := dist
ZIP_NAME := $(PLUGIN_NAME)-$(PLUGIN_VERSION).zip

# Default target
all: build

# Install dependencies
install:
	@echo "Installing PHP dependencies..."
	composer install --no-dev --optimize-autoloader
	@echo "Installing Node dependencies..."
	npm install

# Install dev dependencies
install-dev:
	@echo "Installing PHP dev dependencies..."
	composer install
	@echo "Installing Node dev dependencies..."
	npm install

# Build for production
build: clean install
	@echo "Building assets..."
	npm run build
	@echo "Build complete!"

# Build development (with source maps)
build-dev:
	@echo "Building development assets..."
	npm run build
	@echo "Development build complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -rf $(DIST_DIR)
	rm -rf node_modules
	rm -rf vendor
	rm -f assets/css/*.min.css
	rm -f assets/js/*.min.js
	@echo "Clean complete!"

# Run linters
lint:
	@echo "Running PHP CodeSniffer..."
	composer phpcs || true
	@echo "Running ESLint..."
	npm run lint || true

# Fix linting issues
lint-fix:
	@echo "Fixing PHP coding standards..."
	composer phpcbf || true
	@echo "Fixing JS coding standards..."
	npm run lint -- --fix || true

# Run tests
test:
	@echo "Running PHP tests..."
	composer test

# Create distribution ZIP file
zip: build
	@echo "Creating distribution ZIP..."
	@mkdir -p $(DIST_DIR)
	@mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)
	@cp -r admin $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r assets $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r includes $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r languages $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r templates $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp bc-bridge.php $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp readme.txt $(BUILD_DIR)/$(PLUGIN_NAME)/ 2>/dev/null || true
	@cp LICENSE $(BUILD_DIR)/$(PLUGIN_NAME)/ 2>/dev/null || true
	@cd $(BUILD_DIR) && zip -r ../$(DIST_DIR)/$(ZIP_NAME) $(PLUGIN_NAME)
	@rm -rf $(BUILD_DIR)
	@echo "Created $(DIST_DIR)/$(ZIP_NAME)"

# Create quick ZIP without rebuilding
quick-zip:
	@echo "Creating quick ZIP..."
	@mkdir -p $(DIST_DIR)
	@mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)
	@cp -r admin $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r assets $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r includes $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r languages $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp -r templates $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp bc-bridge.php $(BUILD_DIR)/$(PLUGIN_NAME)/
	@cp readme.txt $(BUILD_DIR)/$(PLUGIN_NAME)/ 2>/dev/null || true
	@cd $(BUILD_DIR) && zip -r ../$(DIST_DIR)/$(ZIP_NAME) $(PLUGIN_NAME)
	@rm -rf $(BUILD_DIR)
	@echo "Created $(DIST_DIR)/$(ZIP_NAME)"

# Deploy to WordPress test site (requires WP_PLUGINS_DIR env var)
deploy:
ifdef WP_PLUGINS_DIR
	@echo "Deploying to $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)..."
	@rm -rf $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)
	@mkdir -p $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)
	@cp -r admin $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@cp -r assets $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@cp -r includes $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@cp -r languages $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@cp -r templates $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@cp bc-bridge.php $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)/
	@echo "Deployed successfully!"
else
	@echo "Error: WP_PLUGINS_DIR environment variable not set"
	@echo "Usage: WP_PLUGINS_DIR=/path/to/wp-content/plugins make deploy"
	@exit 1
endif

# Deploy via symlink (for development)
deploy-link:
ifdef WP_PLUGINS_DIR
	@echo "Creating symlink at $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)..."
	@rm -rf $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)
	@ln -s $(CURDIR) $(WP_PLUGINS_DIR)/$(PLUGIN_NAME)
	@echo "Symlink created!"
else
	@echo "Error: WP_PLUGINS_DIR environment variable not set"
	@echo "Usage: WP_PLUGINS_DIR=/path/to/wp-content/plugins make deploy-link"
	@exit 1
endif

# Watch for changes during development
watch:
	@echo "Watching for changes..."
	npm run watch

# Version bump
version:
ifndef NEW_VERSION
	@echo "Error: NEW_VERSION not specified"
	@echo "Usage: make version NEW_VERSION=1.1.0"
	@exit 1
endif
	@echo "Bumping version to $(NEW_VERSION)..."
	@sed -i '' 's/Version: .*/Version: $(NEW_VERSION)/' bc-bridge.php
	@sed -i '' "s/BC_BRIDGE_VERSION', '.*'/BC_BRIDGE_VERSION', '$(NEW_VERSION)'/" bc-bridge.php
	@sed -i '' 's/"version": ".*"/"version": "$(NEW_VERSION)"/' package.json
	@echo "Version bumped to $(NEW_VERSION)"

# Show current version
show-version:
	@echo "Plugin version: $(PLUGIN_VERSION)"

# Help
help:
	@echo "BC Bridge Plugin Makefile"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all          - Build plugin for production (default)"
	@echo "  install      - Install production dependencies"
	@echo "  install-dev  - Install all dependencies including dev"
	@echo "  build        - Build assets for production"
	@echo "  build-dev    - Build assets for development"
	@echo "  clean        - Remove all build artifacts"
	@echo "  lint         - Run all linters"
	@echo "  lint-fix     - Fix linting issues automatically"
	@echo "  test         - Run PHP tests"
	@echo "  zip          - Create distribution ZIP file"
	@echo "  quick-zip    - Create ZIP without rebuilding"
	@echo "  deploy       - Deploy to WP plugins directory"
	@echo "  deploy-link  - Create symlink for development"
	@echo "  watch        - Watch for changes during development"
	@echo "  version      - Bump version (NEW_VERSION=x.y.z)"
	@echo "  show-version - Show current version"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Environment variables:"
	@echo "  WP_PLUGINS_DIR - WordPress plugins directory (for deploy targets)"
