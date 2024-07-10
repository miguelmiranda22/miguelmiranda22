const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PageSchema = new Schema({
  url: { type: String, required: true, minLength: 11, maxLength: 100 },
  dataAval: { type: Date },
  estado: { type: String, required: true, enum: ["Conforme", "Não conforme", "Por avaliar", "Em avaliação", "Erro na avaliação"], default: "Por avaliar" },
  evaluation: { type: Schema.Types.ObjectId, ref: "Evaluation" },
});

// Export model.
module.exports = mongoose.model("Page", PageSchema);
