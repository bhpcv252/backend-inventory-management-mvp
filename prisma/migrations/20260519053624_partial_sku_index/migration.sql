-- Drop the full unique constraint created by @@unique in schema.prisma
DROP INDEX IF EXISTS "Product_organizationId_sku_key";

-- Partial unique index: only active (non-deleted) products compete for SKU uniqueness
CREATE UNIQUE INDEX product_org_sku_active
  ON "Product"("organizationId", sku)
  WHERE "deletedAt" IS NULL;
