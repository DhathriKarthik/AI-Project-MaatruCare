const mongoose = require("mongoose");

const HappyMomentsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        datetime: {
            type: Date,
            required: true,
        }
    }
);

HappyMomentsSchema.index({userId: 1, datetime: 1}, {unique: true});
module.exports = mongoose.model("HappyMoment", HappyMomentsSchema);