import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  featuredTagTopics: [],

  @action
  async getBannerItems() {
    const bannerItems = [];

    // Fetch topics if featured_tag is set
    if (settings.featured_tag) {
      const sortOrder = settings.sort_by_created ? "created" : "activity";
      const topicList = await this.store.findFiltered("topicList", {
        filter: "latest",
        params: {
          tags: [`${settings.featured_tag}`],
          order: sortOrder,
        },
      });

      bannerItems.push(
        ...topicList.topics
          .filter(
            (topic) =>
              topic.image_url &&
              (!settings.hide_closed_topics || !topic.closed)
          )
          .slice(0, settings.number_of_topics)
          .map((topic) => ({
            type: "topic",
            id: topic.id,
            title: topic.title,
            image_url: topic.image_url,
            url: `/t/${topic.slug}/${topic.id}`,
          }))
      );
    }

    // Fetch categories if configured
    if (settings.featured_categories) {
      const categoryIds = settings.featured_categories.split("|");
      for (const categoryId of categoryIds) {
        const category = await this.store.find("category", categoryId);
        bannerItems.push({
          type: "category",
          id: category.id,
          title: category.name,
          image_url: category.uploaded_logo?.url || category.background_url,
          url: `/c/${category.id}`,
        });
      }
    }

    this.featuredTagTopics = bannerItems;
  },
});
