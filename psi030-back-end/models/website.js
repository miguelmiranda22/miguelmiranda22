const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
  url: { type: String, required: true, minLength: 11, maxLength: 100 },
  dataRegisto: { type: Date, required: true, default: Date.now },
  dataAval: { type: Date },
  pages: [{ type: Schema.Types.ObjectId, ref: "Page" }],
  estado: { type: String, required: true, enum: ["Por avaliar", "Em avaliação", "Avaliado", "Erro na avaliação"], default: "Avaliado" },
});

// Export model.
module.exports = mongoose.model("Website", WebsiteSchema);
