import SimpleSchema from "simpl-schema";


export const AttendeeSchema = {
  userId: {
    type: String,
    optional: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String,
    optional: true
  },
  email: {
    type: String,
    optional: true
  },
  present: {
    type: Boolean,
    optional: true
  }
};

export default new SimpleSchema({
  /* relations */
  projectId: {
    type: String
  },
  /* main attributes */
  name: {
    type: String
  },
  deleted: {
    type: Boolean,
    defaultValue: false
  },
  state: {
    type: String,
    allowedValues: ["pending", "running", "stopped", "completed", "canceled"]
  },
  color: {
    type: String,
    optional: true,
    defaultValue: "#363636"
  },
  type: {
    type: String,
    optional: true,
    defaultValue: "none"
  },
  description: {
    type: String,
    optional: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  subject: {
    type: String,
    optional: true
  },
  agenda: {
    type: String,
    optional: true
  },
  attendees: {
    type: Array,
    optional: true
  },
  "attendees.$": new SimpleSchema(AttendeeSchema),
  report: {
    type: String,
    optional: true
  },
  /* creation dates */
  createdAt: Date,
  createdBy: String,

  /* update dates */
  updatedAt: Date,
  updatedBy: String
});
