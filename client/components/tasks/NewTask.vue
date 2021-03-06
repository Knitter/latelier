<template>
  <div class="new-task">
    <v-dialog
      :value="active"
      max-width="640"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card class="flex-container">
        <v-toolbar v-if="$vuetify.breakpoint.xsOnly" dark color="primary" class="flex0">
          <v-btn icon dark @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-spacer />
          <v-toolbar-items>
            <v-btn
              text
              dark
              :disabled="!valid || loading"
              @click="newTask(true)"
            >
              {{ $t("Create and add") }}
            </v-btn>
            <v-btn
              text
              dark
              :disabled="!valid || loading"
              @click="newTask(false)"
            >
              {{ $t("Create") }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-title class="headline">
          {{ $t("Add new task") }}
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" class="form" @submit.prevent>
            <v-textarea
              ref="name"
              v-model="name"
              class="edit-name"
              :label="$t('Name')"
              outlined
              required
              :rules="nameRules"
              @focus.native="$event.target.select()"
              @keydown.shift.enter="newTask(false)"
            />
            <task-labels-in-new-task
              v-model="labels"
              :project-id="projectId"
            />
            <v-checkbox
              v-model="multiline"
              color="accent"
              :class="{ hidden: !showMultilineOption }"
              :label="$t('Create one task per line')"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="show-desktop">
          <v-spacer />
          <v-btn text @click="close">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(false)"
          >
            {{ $t("Create") }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || loading"
            @click="newTask(true)"
          >
            {{ $t("Create and add") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Lists } from "/imports/api/lists/lists.js";
import { autofocus } from "/imports/ui/autofocus";

export default {
  i18n: {
    messages: {
      en: {
        "New task": "New task",
        Title: "Title",
        "Really create {count} tasks?": "Really create {count} tasks?",
        "Create {count} tasks": "Create {count} tasks",
        "Create one task per line": "Create one task per line",
        "Create and add": "Create and add",
        "Task created": "Task created",
        "Tasks created": "Task created"
      },
      fr: {
        Title: "Titre",
        "Really create {count} tasks?": "Vous allez créer {count} tâches",
        "Create {count} tasks": "Créer {count} tâches",
        "Create one task per line": "Créer une tâche par ligne",
        "Create and add": "Créer et ajouter",
        "Task created": "Tâche créée",
        "Tasks created": "Tâches créées"
      }
    }
  },
  props: {
    active: Boolean,
    projectId: {
      type: String,
      default: ""
    },
    listId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      valid: false,
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => (v && v.length > 0) || this.$t("Name is too short")
      ],
      showDialog: false,
      name: "",
      multiline: false,
      showMultilineOption: false,
      labels: [],
      loading: false
    };
  },
  watch: {
    active(active) {
      if (active) {
        this.$nextTick(() => {
          autofocus.focus(this.$refs.name);
        });
      }
    },
    name(name) {
      let tasks = name.split(/\r?\n/g) || [];
      tasks = tasks.filter((aName) => aName && aName.length > 0);
      if (tasks.length > 1) {
        this.showMultilineOption = true;
      } else {
        this.showMultilineOption = false;
      }
    }
  },
  methods: {
    reset() {
      this.name = "";
      this.multiline = false;
      this.labels = [];
      this.$nextTick(() => {
        autofocus.focus(this.$refs.name);
      });
    },
    newTask(keep) {
      const list = Lists.findOne({ _id: this.listId });
      if (!this.multiline) {
        this.loading = true;
        Meteor.call(
          "tasks.insert",
          list.projectId,
          this.listId,
          this.name,
          this.labels.map((l) => l._id),
          (error, task) => {
            this.loading = false;
            if (error) {
              this.$notifyError(error);
              return;
            }
            this.$notify(this.$t("Task created"));
            this.reset();
            if (!keep) {
              this.close();
              this.$router.push({
                name: "project-task",
                params: {
                  projectId: this.projectId,
                  taskId: task._id
                }
              });
            }
          }
        );
      } else {
        let tasks = this.name.split(/\r?\n/g) || [];
        tasks = tasks.filter((name) => name && name.length > 0);
        this.$confirm(
          this.$t("Really create {count} tasks?", { count: tasks.length }),
          {
            title: this.$t("Confirmation"),
            cancelText: this.$t("Cancel"),
            confirmText: this.$t("Create {count} tasks", {
              count: tasks.length
            })
          }
        ).then((res) => {
          if (res) {
            this.loading = true;
            this.$stopMeteor();

            const labelIds = this.labels.map((l) => l._id);
            tasks.forEach((name) => {
              Meteor.call(
                "tasks.insert",
                list.projectId,
                this.listId,
                name,
                labelIds,
                (error) => {
                  if (error) {
                    this.$notifyError(error);
                  }
                }
              );
              this.loading = false;
              this.reset();
              if (!keep) {
                this.close();
              }
            });
            this.$notify(this.$t("Tasks created"));
            this.$startMeteor();
          }
        });
      }
    },
    close() {
      this.$emit("update:active", false);
      this.$emit("cancel");
    }
  }
};
</script>

<style scoped>
.hidden {
  visibility: hidden;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

</style>
