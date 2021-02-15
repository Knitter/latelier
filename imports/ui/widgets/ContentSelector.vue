<template>
  <v-menu
    v-model="isMenuShown"
    :nudge-bottom="10"
    :min-width="400"
    :close-on-content-click="false"
    offset-y
    @click-outside="isMenuShown = false"
  >
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on" />
    </template>
    <v-card>
      <v-card-text>
        <v-text-field
          ref="input"
          v-model="filter"
          :placeholder="$t('contentSelector.search')"
          prepend-inner-icon="mdi-magnify"
          rounded
          autofocus
          solo
          dense
          hide-details
        />
      </v-card-text>
      <v-divider />
      <v-tabs
        v-model="selectedTab"
        light
        grow
        background-color="white"
        class="tabs"
      >
        <v-tabs-slider color="accent" />
        <v-tab v-if="favoriteProjects.length">
          <v-icon small class="mr-2">
            mdi-star
          </v-icon>
          {{ $t("Favorites") }} ({{favoritesProjectCount}})
        </v-tab>
        <v-tab>
          <v-icon small class="mr-2">
            mdi-clipboard-pulse-outline
          </v-icon>
          {{ $t("Projects") }} ({{projectCount}})
        </v-tab>
        <v-tab>
          <v-icon small class="mr-2">
            mdi-domain
          </v-icon>
          {{ $t("Orgs") }} ({{organizationCount}})
        </v-tab>
        <v-tab-item v-if="favoriteProjects.length" eager :transition="false" :reverse-transition="false">
          <search-projects
            :filter="filter"
            :project-count.sync="favoritesProjectCount"
            :projects-ids="favoriteProjects"
            auto-search
            @select="switchProject"
          />
        </v-tab-item>
        <v-tab-item eager :transition="false" :reverse-transition="false">
          <search-projects
            :filter="filter"
            :project-count.sync="projectCount"
            auto-search
            @select="switchProject"
          />
        </v-tab-item>
        <v-tab-item eager :transition="false" :reverse-transition="false">
          <search-organizations
            :filter="filter"
            :organization-count.sync="organizationCount"
            auto-search
            @select="switchOrganization"
          />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </v-menu>
</template>
<script>
import { mapState } from "vuex";
import SearchOrganizations from "/imports/ui/widgets/search/SearchOrganizations";

export default {
  components: {
    SearchOrganizations
  },
  data() {
    return {
      tab: null,
      filter: "",
      organizationCount: 0,
      projectCount: 0,
      favoritesProjectCount: 0,
      isMenuShown: false
    };
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProjectId"]),
    ...mapState("organization", ["currentOrganization"]),
    selectedTab: {
      get() {
        return this.$route?.meta?.isOrganization ? 1 : this.tab;
      },
      set(newTab) {
        this.tab = newTab;
      }
    },
    favoriteProjects() {
      const favorites = this?.currentUser?.profile?.favoriteProjects;
      if (!Array.isArray(favorites) || !favorites.length) return [];
      return favorites;
    }
  },
  methods: {
    isOrganizationRoute(route) {
      return route?.meta?.isOrganization === true;
    },
    isProjectRoute(route) {
      return route?.meta?.isProject === true;
    },
    async switchOrganization(organization) {
      try {
        if (!organization || (organization._id
        && (organization._id === this.currentOrganizationId))) {
          return false;
        }
        this.isMenuShown = false;
        const routeName = this.isOrganizationRoute(this.$route)
          ? this.$route.name
          : "dashboard-organization-page";
        this.$store.dispatch("project/setCurrentProject", null);
        await this.$router.push({
          name: routeName,
          params: { organizationId: organization._id }
        });
      } catch (error) {
        this.$notifyError(error);
        return false;
      }
      return false;
    },
    async switchProject(project) {
      try {
        if (!project || (project._id && project._id === this.currentProjectId)) {
          return false;
        }
        this.isMenuShown = false;
        const routeName = this.isProjectRoute(this.$route)
          ? this.$route.name
          : "project-dashboard";
        this.$store.dispatch("organization/setCurrentOrganization", null);
        await this.$router.push({
          name: routeName,
          params: { projectId: project._id }
        });
      } catch (error) {
        this.$notifyError(error);
        return false;
      }
      return false;
    }
  }
};
</script>
