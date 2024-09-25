import express from "express"
import { mentorModel, studentModel } from "../db_utils/model.js";
import { v4 } from "uuid";

const mentorsRouter = express.Router();


// 1. To create a new mentor
mentorsRouter.post("/", async (req, res) => {
    const mentor = req.body;
    const mentorexists = await mentorModel.findOne({ name: mentor.name, mailId: mentor.mailId, phoneNo: mentor.phoneNo })
    console.log(mentorexists);
    if (mentorexists == null) {
        const mentorobj = new mentorModel({ ...mentor, id: v4() });
        try {
            await mentorobj.save();
            res.status(200).json({ msg: "mentor created successfully" });
        }
        catch (e) {
            res.status(400).json({ msg: `mentor creation failed with error ${e}` });
        }
    }
    else {
        res.status(400).json({ msg: `${mentorexists.name} already present` });
    }
}
);

// To get list of all mentors
mentorsRouter.get("/", async (req, res) => {
    const mentors = await mentorModel.find({},{id:0,_id:0,__v:0});
    res.json(mentors);
});

// To get mentor based on ID
mentorsRouter.get("/:id",async (req,res)=>{
    const id= req.params.id;
    const mentor = await mentorModel.findOne({id},{id:0,_id:0,__v:0});
    //console.log(mentor);
    if (mentor == null){
        res.status(400).json({msg:`id ${id} is not valid`});
    }
    else{
        res.json(mentor);
    }
});

// 3. To assign list of students to a mentor when a student newly joined course
// body payload - { students_id:["","",""]} -> need to pass list of students id
// In mentors collection student_assigned will get updated
// In students collection both present_mentor and mentor list will get updated

mentorsRouter.post("/:id/assign-student", async (req,res)=>{
    const mentor_id = req.params.id;
    const mentor = await mentorModel.findOne({id:mentor_id});
    if(mentor == null){
        res.status(400).json({msg:`mentor Id ${mentor_id} is not valid`});
    }
    else{
        const { students_id } = req.body;
        let not_valid_students =[];
        let students_having_mentor =[];
        let valid_students =[];
        let count =0;
        let students_assigned = mentor.students_assigned;
        students_id.forEach(async (studentid) => {
            
            const student_exists = await studentModel.findOne({id:studentid});
            if (student_exists == null){
                not_valid_students.push(studentid);
                count++;
            }
            else{
                if(student_exists.Present_mentor == null){
                    valid_students.push(student_exists.name);
                    students_assigned.push({id:studentid,name:student_exists.name});
                    console.log(students_assigned);
                    await mentorModel.updateOne({id:mentor_id},{students_assigned});
                    await studentModel.updateOne({id:studentid},{Present_mentor:mentor.name,mentor_list:[{id:mentor.id,name:mentor.name}]});
                    count++;
                }
                else{
                    students_having_mentor.push(student_exists.name);
                    count++;
                }
            }
            if(count == students_id.length){
                res.json({"list of not valid student ids":not_valid_students,
                    "students_having_mentor_already":students_having_mentor,
                    "list of students for whom mentor details updated successfully ":valid_students
                });
            }
        });
        
    }
});


// 5. To get list of students for a particular mentor
mentorsRouter.get("/:id/students-assigned", async (req,res) => {
    const mentor_id = req.params.id;
    const mentor = await mentorModel.findOne({id:mentor_id});
    if( mentor == null){
        res.status(400).json({msg:`mentor Id ${mentor_id} is not valid`});
    }
    else{
        res.json({students_assigned:mentor.students_assigned});
    }
})

export default mentorsRouter;