import { Schema } from "mongoose";

export const EventSchema = new Schema({
    id: String,

    type: String,

    public: Boolean,

    created_at: String
}, { strict: false });