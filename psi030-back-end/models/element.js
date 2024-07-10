const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ElementSchema = new Schema({
  elemento: { type: String, required: true },
  resultado: { type: String, required: true, enum: ["Passado", "Aviso", "Falhado", "Não aplicável"] },
});

// Export model.
module.exports = mongoose.model("Element", ElementSchema);