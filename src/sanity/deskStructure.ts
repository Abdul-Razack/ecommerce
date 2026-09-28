import { BulkUploadTool } from './components/BulkUploadTool';

export const deskStructure = (S) =>
  S.list()
    .title("Posh Pigeon Admin")
    .items([
      // Content Section
      S.listItem()
        .title("Storefront")
        .child(
          S.list()
            .title("Storefront CMS")
            .items([
              S.listItem()
                .title("Homepage")
                .id("homePage")
                .child(
                  S.document()
                    .schemaType("homePage")
                    .documentId("homePage")
                ),
            ])
        ),
      S.divider(),
      
      // Inventory Section
      S.listItem()
        .title("Catalog")
        .child(
          S.list()
            .title("Catalog Management")
            .items([
              S.listItem()
                .title("Products")
                .child(S.documentTypeList("product").title("All Products")),
              S.listItem()
                .title("Categories")
                .child(S.documentTypeList("category").title("Categories")),
            ])
        ),
      S.divider(),
      
      // Operations Section
      S.listItem()
        .title("Operations")
        .child(
          S.list()
            .title("Store Operations")
            .items([
              S.listItem()
                .title("Orders")
                .child(S.documentTypeList("order").title("Customer Orders")),
              S.listItem()
                .title("Customers")
                .child(S.documentTypeList("customer").title("Registered Customers")),
              S.listItem()
                .title("Bulk Catalog Ingestion")
                .child(
                  S.component(BulkUploadTool)
                    .title("Bulk Upload")
                    .id("bulk-upload")
                ),
            ])
        ),
      S.divider(),
      
      // Promotions Section
      S.listItem()
        .title("Promotions")
        .child(
          S.list()
            .title("Promotional Campaigns")
            .items([
              S.listItem()
                .title("Coupons")
                .child(S.documentTypeList("coupon").title("All Coupons")),
            ])
        ),
      
      // Automatic list for other types
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !["homePage", "adminUser", "product", "category", "order", "customer", "coupon"].includes(listItem.getId())
      ),
    ]);
