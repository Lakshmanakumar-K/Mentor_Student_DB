import { Schema, model } from "mongoose";

const mentorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mailId: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    students_assigned: {
        type: Array,
        default: [],
    },
    id: {
        type: String,
        required: true,
    }
});

export const mentorModel = new model("mentor", mentorSchema, "mentors");

const studentSchema = new Schema({
    name: {
        type: String,
        rerquired: true,
    },
    mailId: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    Present_mentor:{
        type:String,
        default:null,
    },
    mentor_list:{
        type:Array,
        required:true,
    },
    id:{
        type:String,
        required:true,
    }
});

export const studentModel = new model("student",studentSchema,"students");

