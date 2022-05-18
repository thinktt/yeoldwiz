const game = {
  type: "object",
  properties: {
    id: {type: "string", pattern: "^[a-zA-Z0-9]{8}$" },
    opponent: {
      type: "string", 
      // enum: ["Marius", "Orin"],
      pattern: "^[a-zA-Z0-9]*$",
    }
  },
  required: ["id", "opponent"],
  additionalProperties: false
}

module.exports = { game }