import mongoose from "mongoose";

export type UserType = {
    _id: string,
    password: string;
    isin?: boolean;
}
const User = new mongoose.Schema({
    // users email is used as id to document
    _id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // Loged in or out?
    isin:{
        type: Boolean,
        default: false
    },
})



export const Users = mongoose.model('user',User);

