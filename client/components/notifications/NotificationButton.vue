<template>
  <div v-if="isConnected" class="notification-button">
    <notifications-dialog :active.sync="showDialog" />
    <v-btn icon @click="showDialog = true">
      <v-badge color="red" :value="notificationsCount > 0" overlap>
        <template v-slot:badge>
          <span>{{ notificationsCount }}</span>
        </template>
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDialog: false
    };
  },
  meteor: {
    isConnected() {
      if (Meteor) {
        return Meteor.userId();
      }
      return false;
    },
    notificationsCount() {
      if (Meteor) {
        const user = Meteor.user();
        if (user && user.notifications) {
          return user.notifications.count;
        }
      }
      return 0;
    }
  }
};
</script>
