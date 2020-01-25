import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* main attributes */
  name: {
    type: String
  },

  description: {
    type: String,
    optional: true
  },

  xml: {
    type: String,
    optional: true
  },

  /* creation dates */
  createdAt: Date,
  createdBy: String
});
