const game = {
  type: "object",
  properties: {
    id: {type: "string", pattern: "^[a-zA-Z0-9]{8}$" },
    user: { type: "string"},
    opponent: {
      type: "string", 
      // enum: ["Marius", "Orin"],
      pattern: "^[a-zA-Z0-9]*$",
    },
  },
  required: ["id", "user", "opponent"],
  additionalProperties: false
}

module.exports = { game }