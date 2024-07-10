const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EvaluationSchema = new Schema({
    tem_erro_A: { type: Boolean, required: true, default: false },
    tem_erro_AA: { type: Boolean, required: true, default: false },
    tem_erro_AAA: { type: Boolean, required: true, default: false },
    erros: { type: Schema.Types.Mixed, required: true, default: {} },
    num_passed: { type: Number, required: true, default: 0 },
    num_warning: { type: Number, required: true, default: 0 },
    num_failed: { type: Number, required: true, default: 0 },
    num_inapplicable: { type: Number, required: true, default: 0 },
    tests: [{ type: Schema.Types.ObjectId, ref: "Test" }],
});

// Export model.
module.exports = mongoose.model("Evaluation", EvaluationSchema);