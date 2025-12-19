#!/bin/bash
#
# WooCommerce Test Data Generator (WP-CLI)
# Alternative to REST API for server-side data generation
#
# Usage:
#   ./wp-cli-generate.sh [scale] [--dry-run]
#
# Scales: small, medium (default), large
#
# Requirements:
#   - WP-CLI installed on the server
#   - SSH access to the WordPress site
#   - WooCommerce plugin active
#
# For WPEngine:
#   ssh wpengine@bcmigration.ssh.wpengine.net 'bash -s' < scripts/wp-cli-generate.sh

set -e

# ============================================
# Configuration
# ============================================

SCALE="${1:-medium}"
DRY_RUN="${2:-}"

case $SCALE in
  small)
    CATEGORIES=10
    SIMPLE_PRODUCTS=50
    VARIABLE_PRODUCTS=20
    VIRTUAL_PRODUCTS=5
    DOWNLOADABLE_PRODUCTS=5
    CUSTOMERS=30
    ORDERS=20
    ;;
  medium)
    CATEGORIES=50
    SIMPLE_PRODUCTS=300
    VARIABLE_PRODUCTS=150
    VIRTUAL_PRODUCTS=30
    DOWNLOADABLE_PRODUCTS=20
    CUSTOMERS=200
    ORDERS=100
    ;;
  large)
    CATEGORIES=100
    SIMPLE_PRODUCTS=600
    VARIABLE_PRODUCTS=300
    VIRTUAL_PRODUCTS=60
    DOWNLOADABLE_PRODUCTS=40
    CUSTOMERS=500
    ORDERS=300
    ;;
  *)
    echo "Invalid scale: $SCALE. Use small, medium, or large"
    exit 1
    ;;
esac

echo "============================================"
echo "WooCommerce Test Data Generator (WP-CLI)"
echo "============================================"
echo "Scale: $SCALE"
echo "Dry Run: ${DRY_RUN:-false}"
echo ""
echo "Data to generate:"
echo "  Categories: $CATEGORIES"
echo "  Simple Products: $SIMPLE_PRODUCTS"
echo "  Variable Products: $VARIABLE_PRODUCTS"
echo "  Virtual Products: $VIRTUAL_PRODUCTS"
echo "  Downloadable Products: $DOWNLOADABLE_PRODUCTS"
echo "  Customers: $CUSTOMERS"
echo "  Orders: $ORDERS"
echo "============================================"
echo ""

# Check if WP-CLI is available
if ! command -v wp &> /dev/null; then
    echo "ERROR: WP-CLI is not installed or not in PATH"
    exit 1
fi

# Check WooCommerce is active
if ! wp plugin is-active woocommerce 2>/dev/null; then
    echo "ERROR: WooCommerce is not active"
    exit 1
fi

# ============================================
# Helper Functions
# ============================================

random_price() {
    local min=${1:-10}
    local max=${2:-500}
    echo "$(( RANDOM % (max - min + 1) + min )).99"
}

random_element() {
    local arr=("$@")
    echo "${arr[RANDOM % ${#arr[@]}]}"
}

random_string() {
    cat /dev/urandom | tr -dc 'A-Z0-9' | fold -w ${1:-8} | head -n 1
}

log() {
    echo "[$(date +%H:%M:%S)] $1"
}

# ============================================
# Data Arrays
# ============================================

ADJECTIVES=("Premium" "Deluxe" "Professional" "Classic" "Modern" "Vintage" "Ultra" "Essential")
PRODUCT_TYPES=("Widget" "Gadget" "Tool" "Set" "Kit" "Bundle" "Pack" "Device")
NOUNS=("Alpha" "Beta" "Gamma" "Delta" "Omega" "Zenith" "Apex" "Prime")
COLORS=("Red" "Blue" "Green" "Black" "White" "Yellow" "Orange" "Purple" "Pink" "Gray")
SIZES=("XS" "S" "M" "L" "XL" "XXL")
CATEGORY_NAMES=("Electronics" "Clothing" "Home" "Sports" "Books" "Toys" "Health" "Automotive" "Jewelry" "Food")

# Track created IDs
declare -a CATEGORY_IDS=()
declare -a PRODUCT_IDS=()
declare -a CUSTOMER_IDS=()

# ============================================
# Create Categories
# ============================================

create_categories() {
    log "Creating $CATEGORIES categories..."

    local created=0
    local level=0
    local parent_ids=()

    # Create root categories (1/4 of total)
    local root_count=$((CATEGORIES / 4))
    for ((i=0; i<root_count; i++)); do
        local name="$(random_element "${CATEGORY_NAMES[@]}") $(random_string 3)"

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create category: $name"
            CATEGORY_IDS+=("fake-$i")
        else
            local id=$(wp wc product_cat create --name="$name" --porcelain 2>/dev/null || echo "")
            if [[ -n "$id" ]]; then
                CATEGORY_IDS+=("$id")
                parent_ids+=("$id")
                log "Created category: $name (ID: $id)"
                ((created++))
            fi
        fi
    done

    # Create subcategories (rest)
    local remaining=$((CATEGORIES - root_count))
    for ((i=0; i<remaining; i++)); do
        local name="$(random_element "${ADJECTIVES[@]}") $(random_element "${NOUNS[@]}) $(random_string 2)"
        local parent=""

        if [[ ${#parent_ids[@]} -gt 0 ]]; then
            parent="${parent_ids[RANDOM % ${#parent_ids[@]}]}"
        fi

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create subcategory: $name (parent: ${parent:-none})"
            CATEGORY_IDS+=("fake-$((root_count + i))")
        else
            local cmd="wp wc product_cat create --name=\"$name\""
            [[ -n "$parent" ]] && cmd+=" --parent=$parent"
            cmd+=" --porcelain"

            local id=$(eval $cmd 2>/dev/null || echo "")
            if [[ -n "$id" ]]; then
                CATEGORY_IDS+=("$id")
                log "Created subcategory: $name (ID: $id, parent: ${parent:-none})"
                ((created++))
            fi
        fi
    done

    log "Created $created categories"
}

# ============================================
# Create Simple Products
# ============================================

create_simple_products() {
    log "Creating $SIMPLE_PRODUCTS simple products..."

    for ((i=0; i<SIMPLE_PRODUCTS; i++)); do
        local name="$(random_element "${ADJECTIVES[@]}") $(random_element "${NOUNS[@]}") $(random_element "${PRODUCT_TYPES[@]}")"
        local sku=""
        local price=$(random_price)
        local cat=""

        # SKU for most products
        if [[ $i -ge 20 ]]; then
            sku="TEST-$(random_string 8)"
        fi

        # Category for most products
        if [[ ${#CATEGORY_IDS[@]} -gt 0 && $i -lt $((SIMPLE_PRODUCTS - 10)) ]]; then
            cat="${CATEGORY_IDS[RANDOM % ${#CATEGORY_IDS[@]}]}"
        fi

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create product: $name"
            PRODUCT_IDS+=("fake-$i")
        else
            local cmd="wp wc product create --name=\"$name\" --type=simple --regular_price=$price"
            [[ -n "$sku" ]] && cmd+=" --sku=$sku"
            [[ -n "$cat" ]] && cmd+=" --categories=$cat"
            cmd+=" --porcelain"

            local id=$(eval $cmd 2>/dev/null || echo "")
            if [[ -n "$id" ]]; then
                PRODUCT_IDS+=("$id")
                log "Created product: $name (ID: $id)"
            fi
        fi

        # Brief pause to avoid overwhelming the server
        sleep 0.1
    done

    log "Created ${#PRODUCT_IDS[@]} simple products"
}

# ============================================
# Create Variable Products
# ============================================

create_variable_products() {
    log "Creating $VARIABLE_PRODUCTS variable products..."

    for ((i=0; i<VARIABLE_PRODUCTS; i++)); do
        local name="$(random_element "${ADJECTIVES[@]}") $(random_element "${NOUNS[@]}") Variant"
        local sku="VAR-$(random_string 6)"
        local cat=""

        if [[ ${#CATEGORY_IDS[@]} -gt 0 ]]; then
            cat="${CATEGORY_IDS[RANDOM % ${#CATEGORY_IDS[@]}]}"
        fi

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create variable product: $name"
            PRODUCT_IDS+=("fake-var-$i")
        else
            # Create the variable product
            local cmd="wp wc product create --name=\"$name\" --type=variable --sku=$sku"
            [[ -n "$cat" ]] && cmd+=" --categories=$cat"
            cmd+=" --porcelain"

            local id=$(eval $cmd 2>/dev/null || echo "")
            if [[ -n "$id" ]]; then
                PRODUCT_IDS+=("$id")
                log "Created variable product: $name (ID: $id)"

                # Create attribute
                wp wc product_attribute create --name="Color" --slug="color" --porcelain 2>/dev/null || true

                # Add variations (simplified - just 3 color variations)
                local var_colors=("Red" "Blue" "Black")
                for color in "${var_colors[@]}"; do
                    local var_price=$(random_price 20 200)
                    local var_sku="$sku-$color"
                    wp wc product_variation create $id \
                        --attributes='[{"name":"Color","option":"'$color'"}]' \
                        --regular_price=$var_price \
                        --sku=$var_sku \
                        2>/dev/null || true
                done

                log "  Added 3 variations to product $id"
            fi
        fi

        sleep 0.2
    done

    log "Created variable products with variations"
}

# ============================================
# Create Virtual Products
# ============================================

create_virtual_products() {
    log "Creating $VIRTUAL_PRODUCTS virtual products..."

    for ((i=0; i<VIRTUAL_PRODUCTS; i++)); do
        local name="Digital $(random_element "${ADJECTIVES[@]}") Service"
        local sku="VIRT-$(random_string 6)"
        local price=$(random_price 5 100)

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create virtual product: $name"
            PRODUCT_IDS+=("fake-virt-$i")
        else
            local id=$(wp wc product create \
                --name="$name" \
                --type=simple \
                --virtual=true \
                --sku=$sku \
                --regular_price=$price \
                --porcelain 2>/dev/null || echo "")

            if [[ -n "$id" ]]; then
                PRODUCT_IDS+=("$id")
                log "Created virtual product: $name (ID: $id)"
            fi
        fi

        sleep 0.1
    done
}

# ============================================
# Create Downloadable Products
# ============================================

create_downloadable_products() {
    log "Creating $DOWNLOADABLE_PRODUCTS downloadable products..."

    for ((i=0; i<DOWNLOADABLE_PRODUCTS; i++)); do
        local name="Downloadable $(random_element "${ADJECTIVES[@]}") File"
        local sku="DL-$(random_string 6)"
        local price=$(random_price 10 200)

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create downloadable product: $name"
            PRODUCT_IDS+=("fake-dl-$i")
        else
            local id=$(wp wc product create \
                --name="$name" \
                --type=simple \
                --virtual=true \
                --downloadable=true \
                --sku=$sku \
                --regular_price=$price \
                --porcelain 2>/dev/null || echo "")

            if [[ -n "$id" ]]; then
                PRODUCT_IDS+=("$id")
                log "Created downloadable product: $name (ID: $id)"
            fi
        fi

        sleep 0.1
    done
}

# ============================================
# Create Customers
# ============================================

create_customers() {
    log "Creating $CUSTOMERS customers..."

    for ((i=0; i<CUSTOMERS; i++)); do
        local first=$(random_element "John" "Jane" "Bob" "Alice" "Charlie" "Diana" "Frank" "Grace")
        local last=$(random_element "Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis")
        local email="test-${first,,}-${last,,}-$(random_string 4)@example.com"

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create customer: $email"
            CUSTOMER_IDS+=("fake-$i")
        else
            local id=$(wp wc customer create \
                --email="$email" \
                --first_name="$first" \
                --last_name="$last" \
                --porcelain 2>/dev/null || echo "")

            if [[ -n "$id" ]]; then
                CUSTOMER_IDS+=("$id")
                log "Created customer: $email (ID: $id)"
            fi
        fi

        sleep 0.05
    done

    log "Created ${#CUSTOMER_IDS[@]} customers"
}

# ============================================
# Create Orders
# ============================================

create_orders() {
    log "Creating $ORDERS orders..."

    local statuses=("pending" "processing" "on-hold" "completed" "cancelled" "refunded" "failed")

    for ((i=0; i<ORDERS; i++)); do
        local status=$(random_element "${statuses[@]}")
        local customer=""
        local product=""

        if [[ ${#CUSTOMER_IDS[@]} -gt 0 ]]; then
            customer="${CUSTOMER_IDS[RANDOM % ${#CUSTOMER_IDS[@]}]}"
        fi

        if [[ ${#PRODUCT_IDS[@]} -gt 0 ]]; then
            product="${PRODUCT_IDS[RANDOM % ${#PRODUCT_IDS[@]}]}"
        fi

        if [[ "$DRY_RUN" == "--dry-run" ]]; then
            log "[DRY RUN] Would create order: status=$status"
        else
            local cmd="wp wc shop_order create --status=$status"
            [[ -n "$customer" ]] && cmd+=" --customer_id=$customer"
            cmd+=" --porcelain"

            local id=$(eval $cmd 2>/dev/null || echo "")
            if [[ -n "$id" ]]; then
                # Add line item if we have a product
                if [[ -n "$product" ]]; then
                    wp wc shop_order update $id \
                        --line_items='[{"product_id":'$product',"quantity":1}]' \
                        2>/dev/null || true
                fi
                log "Created order #$id (status: $status)"
            fi
        fi

        sleep 0.1
    done
}

# ============================================
# Main Execution
# ============================================

main() {
    local start_time=$(date +%s)

    create_categories
    create_simple_products
    create_variable_products
    create_virtual_products
    create_downloadable_products
    create_customers
    create_orders

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "============================================"
    echo "Generation Complete!"
    echo "============================================"
    echo "Duration: ${duration}s"
    echo "Categories: ${#CATEGORY_IDS[@]}"
    echo "Products: ${#PRODUCT_IDS[@]}"
    echo "Customers: ${#CUSTOMER_IDS[@]}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run assess' to verify the data"
    echo "  2. Run 'npm run dashboard' to view the assessment"
    echo "============================================"
}

main
