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
    is_in:{
        type: Boolean,
        default: false
    },
    // A verified user?
    verified:{
        type: Boolean,
        default: false
    },
    // Last verification request time in milliseconds
    last_verify_request: {
        type: Number,
        default: 0
    },
    // Latest requested verification code
    verify_code: {
        type: String,
        default: ''
    },
})



export const Users = mongoose.model('user',User);

