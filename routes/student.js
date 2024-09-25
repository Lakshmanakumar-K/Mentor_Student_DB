import express from "express"
import { v4 } from "uuid";
import { studentModel, mentorModel } from "../db_utils/model.js";

const studentsRouter = express.Router();


// 2. To create a Student
studentsRouter.post("/", async (req, res) => {
    const student = req.body;
    const studentexists = await studentModel.findOne({ name: student.name, mailId: student.mailId, phoneNo: student.phoneNo });
    if (studentexists == null) {
        const studentObj = new studentModel({ ...student, mentor_list: [], id: v4() });
        console.log(studentObj.Present_mentor);
        try {
            await studentObj.save();
            res.json({ msg: "Student created successfully" });
        }
        catch (e) {
            res.status(400).json({ msg: `student creation failed with error ${e}` });
        }
    }
    else {
        res.status(400).json({ msg: `${studentexists.name} already present` });
    }
});

// To get list of all students
studentsRouter.get("/", async (req, res) => {
    const students = await studentModel.find({}, { id: 0, _id: 0, __v: 0 });
    res.json(students);
});

// To get student based on ID
studentsRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    const student = await studentModel.findOne({ id }, { id: 0, _id: 0, __v: 0 });
    //console.log(mentor);
    if (student == null) {
        res.status(400).json({ msg: `id ${id} is not valid` });
    }
    else {
        res.json(student);
    }
});

// 4. To change mentor for a student
// Update present mentor field in students collection
// add newmentor to mentor_list array in students collection
// update new student details in students_assigned array of new mentor in mentors collection
// remove the student details in student_assigned array from old mentor in mentors collection
studentsRouter.put("/change-mentor/:id", async (req, res) => {
    const student_id = req.params.id;
    const { mentor_id } = req.body;
    const student = await studentModel.findOne({ id: student_id });
    if (student == null) {
        res.status(400).json({ msg: `id ${student_id} is not valid` });
    }
    else if(student.Present_mentor == null){
        res.status(400).json({msg:"Mentor is not yet assigned for student, kindly assign a mentor to the studnet"});
    }
    else {
        const new_mentor = await mentorModel.findOne({ id: mentor_id });
        if (new_mentor == null) {
            res.status(400).json({ msg: `mentor Id ${mentor_id} is not valid` })
        }
        else if(student.Present_mentor == new_mentor.name){
            res.status(400).json({msg:`${new_mentor.name} is present mentor for student, kindly provide correct mentor ID`})
        }
        else {
            const old_mentor = await mentorModel.findOne({ name: student.Present_mentor, id: student.mentor_list[student.mentor_list.length - 1].id });

            let mentor_list = student.mentor_list;
            mentor_list.push({ id: new_mentor.id, name: new_mentor.name });
            await studentModel.updateOne({ id: student.id }, { mentor_list, Present_mentor: new_mentor.name });

            let new_mentor_students_assigned = new_mentor.students_assigned;
            new_mentor_students_assigned.push({ id: student.id, name: student.name });
            await mentorModel.updateOne({ id: new_mentor.id }, { students_assigned: new_mentor_students_assigned });

            let old_mentor_students_assigned = old_mentor.students_assigned;
            let index = old_mentor_students_assigned.findIndex((obj) => obj.id == student.id);
            console.log(index);
            old_mentor_students_assigned.splice(index, 1);
            console.log(old_mentor_students_assigned);
            await mentorModel.updateOne({id:old_mentor.id},{students_assigned:old_mentor_students_assigned});

            res.json({msg:"mentor changed successfully"});
        }
    }
});

// 6. To get previously assigned mentor for a particular student
// Theres ia chance mentor have not assigned yet or there is only one mentor not any previous mentor
studentsRouter.get("/:id/previous-mentor", async (req,res) => {
    const student_id = req.params.id;
    const student = await studentModel.findOne({id:student_id});
    if(student == null){
        res.status(400).json({msg:`student ID ${student_id} is not valid`});
    }
    else{
        if (student.Present_mentor == null){
            res.json({msg:`metor is not yet assigned for student ${student.name}`});
        }
        else if(student.mentor_list.length == 1){
            res.json({msg:`student ${student.name} present mentor is ${student.Present_mentor}, not having previous mentor`})
        }
        else{
            const previous_mentor = student.mentor_list[student.mentor_list.length - 2];
            res.json({previous_mentor});
        }
    }
})

export default studentsRouter;