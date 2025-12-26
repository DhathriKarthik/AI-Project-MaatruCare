const mongoose = require("mongoose");

const JournalsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        entryDateTime: {
            type: Date,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    }
);

JournalsSchema.index({userID: 1, entryDateTime: -1}, {unique: true});
module.exports = mongoose.model("Journal", JournalsSchema);