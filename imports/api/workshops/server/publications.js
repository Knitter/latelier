import { publishComposite } from "meteor/reywood:publish-composite";
import { Projects } from "/imports/api/projects/projects";
import { Workshops } from "/imports/api/workshops/workshops";
import { Sessions } from "/imports/api/workshops/sessions/sessions";
import { Tracks } from "/imports/api/workshops/tracks/tracks";
import {
  Permissions,
  checkCanReadProject
} from "/imports/api/permissions/permissions";

publishComposite("workshops", function(projectId) {
  return {
    find() {
      const userId = Meteor.userId();
      const query = {
        _id: projectId,
        deleted: { $ne: true }
      };
      if (!Permissions.isAdmin(userId)) {
        query.$or = [
          { createdBy: userId },
          { members: userId },
          { isPublic: true }
        ];
      }
      return Projects.find(query);
    },
    children: [
      {
        find(project) {
          return Workshops.find(
            { projectId: project._id },
            { sort: { createdAt: 1 } }
          );
        }
      }
    ]
  };
});

publishComposite("workshop", function(workshopId) {
  return {
    find() {
      const workshop = Workshops.findOne({ _id: workshopId });
      if (!workshop) {
        return this.ready();
      }
      checkCanReadProject(workshop.projectId);
      return Workshops.find({ _id: workshopId });
    },
    children: [
      {
        /* project */
        find(workshop) {
          return Projects.find({ _id: workshop.projectId });
        }
      },
      {
        /* sessions */
        find(workshop) {
          return Sessions.find(
            { workshopId: workshop._id },
            { sort: { order: 1 } }
          );
        }
      },
      {
        /* tracks */
        find(workshop) {
          return Tracks.find(
            { workshopId: workshop._id, deleted: { $ne: true } },
            { sort: { order: 1 } }
          );
        }
      }
    ]
  };
});
