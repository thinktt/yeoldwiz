const game = {
  type: "object",
  properties: {
    id: {type: "string", pattern: "^[a-zA-Z0-9]{8}$" },
    user: { 
      type: "string", 
      pattern: "[a-zA-Z0-9][a-zA-Z0-9_-]{0,28}[a-zA-Z0-9]",
    },
    opponent: {
      type: "string", 
      // enum: ["Marius", "Orin"],
      pattern: "^[a-zA-Z0-9]*$",
    },
  },
  required: ["id", "user", "opponent"],
  additionalProperties: false
}

const user = {
  type: "object",
  properties: {
    id: { 
      type: "string", 
      pattern: "[a-zA-Z0-9][a-zA-Z0-9_-]{0,28}[a-zA-Z0-9]",
    },
    // kingCmVersion: {type: "string", enum: ["9", "10", "11"] },
    kingBlob: {type: "string"},
    hasAcceptedDisclaimer: {type: "boolean"},
  },
  required: ["id", "kingBlob", "hasAcceptedDisclaimer"],
  additionalProperties: false
}

module.exports = { game, user }