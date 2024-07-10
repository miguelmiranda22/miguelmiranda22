const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TestSchema = new Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true, enum: ["Regra ACT", "Técnica WCAG"] },
  resultado: { type: String, required: true, enum: ["Passado", "Aviso", "Falhado", "Não aplicável"] },
  nivel: [{ type: String, maxlength: 3 }],
  elementos: [{ type: Schema.Types.ObjectId , ref: "Element" }],
});

// Export model.
module.exports = mongoose.model("Test", TestSchema);