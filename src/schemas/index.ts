/**
 * Schema exports
 */

// WooCommerce schemas
export {
  // Schemas
  wcImageSchema,
  wcDimensionsSchema,
  wcMetaDataSchema,
  wcDownloadSchema,
  wcCategorySchema,
  wcCategoryListSchema,
  wcAttributeSchema,
  wcProductSchema,
  wcProductListSchema,
  wcVariationSchema,
  wcVariationListSchema,
  wcAddressSchema,
  wcCustomerSchema,
  wcCustomerListSchema,
  wcOrderSchema,
  wcOrderListSchema,
  wcOrderLineItemSchema,
  // Validators
  validateWCResponse,
  validateWCResponseSoft,
  // Types
  type WCProductParsed,
  type WCVariationParsed,
  type WCCategoryParsed,
  type WCCustomerParsed,
  type WCOrderParsed,
} from './wc.js';

// BigCommerce schemas
export {
  // Schemas
  bcImageSchema,
  bcCustomUrlSchema,
  bcCategoryCreateSchema,
  bcOptionValueSchema,
  bcOptionSchema,
  bcVariantSchema,
  bcProductCreateSchema,
  bcAddressSchema,
  bcCustomerCreateSchema,
  bcOrderCreateSchema,
  bcOrderProductSchema,
  bcOrderCustomProductSchema,
  // Validators
  validateBCPayload,
  validateBCPayloadSoft,
  getBCValidationErrors,
  // Types
  type BCProductCreate,
  type BCCategoryCreate,
  type BCCustomerCreate,
  type BCOrderCreate,
  type BCVariantCreate,
  type BCOptionCreate,
} from './bc.js';
