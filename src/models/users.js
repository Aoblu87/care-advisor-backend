import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: function () {
            return this.googleId ? false : true
        },
    },
    googleId: {
        type: String,
        required: function () {
            return this.password ? false : true
        },
    },
    dayOfBirth: {
        type: String,
    },
    avatar: {
        type: String,
    },
    createdAt: {
        type: String,
    },
})

export const User = mongoose.model("Users", UserSchema)
