import { client } from '@/shared/lib/sanity';

export const cmsService = {
  /**
   * Fetch structured homepage data including hero, collections, and trending products
   */
  async getHomePageData() {
    return await client.fetch(`
      *[_type == "homePage"][0] {
        hero,
        featuredCollections[] {
          title,
          image,
          "slug": category->slug.current
        },
        trendingProducts {
          heading,
          products[]-> {
            _id, name, slug, price, mainImage, "category": category->name
          }
        },
        editorial,
        announcement
      }
    `);
  }
};
