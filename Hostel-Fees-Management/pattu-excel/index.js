const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
// const Student  = require('./studentSchema')
const csvtojson = require('csvtojson')
const fs=require('fs')
const path=require('path')
const app = express()

const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
mongoose.connect('mongodb://localhost:27017/MongoExcelDemo').then(() => {     // MongoDB connection
    console.log('database connected')
});


app.use(express.static('public'))    // static folder
app.set('view engine','ejs')             // set the template engine








const studentSchema = mongoose.Schema({
        
        REF_NO : {type: String, required : true},
        NAME : {type : String, required : true},
        ROOM_NO : {type: String, required : true},
        FEES : {type: String, required : true},
        img:{type: String, required : true}
})



Student= mongoose.model('Student', studentSchema)
var excelStorage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
         cb(null,__dirname+'/excelUploads');      // file added to the public folder of the root directory
    },  
    filename:(req,file,cb)=>{  
         cb(null,file.originalname);  
    }  
});  
var excelUploads = multer({storage:excelStorage}); 
app.get('/',(req,res) => {
       res.render('welcome');
      
       
})
app.post('/',(req,res) => {
       res.render('welcome');
      
       
})
app.post('/c',(req,res)=>{
    res.render('index')
})
// upload excel file and import in mongodb
app.post('/uploadExcelFile', excelUploads.single("uploadfile"), (req, res) =>{  
       importFile(__dirname+'/excelUploads/' + req.file.filename);
            
       function importFile(filePath){
              //  Read Excel File to Json Data
                var arrayToInsert = [];
                csvtojson().fromFile(filePath).then(source => {
              // Fetching the all data from each row
              //obj={data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),contentType: 'image/png'}
                for (var i = 0; i < source.length; i++) {
                    console.log(source[i]["name"])
                    var singleRow = {
                        REF_NO: source[i]["REF_NO"],
                        NAME: source[i]["NAME"],
                        ROOM_NO: source[i]["ROOM_NO"],
                        FEES: source[i]["FEES"],
                        img: source[i] ["img"]
                        
                    };
                    arrayToInsert.push(singleRow);
                }
             //inserting into the table student
             Student.insertMany(arrayToInsert, (err, result) => {
                    if (err) console.log(err);
                        if(result){
                            console.log("File imported successfully.");
                            res.render("success")
                        }
                    });
                });
           }
})



app.listen(3000, () => {
    console.log('server started at port 3000')
})

app.post('/post',(req,res)=>{
    var REF_NO=req.body.search
    console.log(REF_NO)
    Student.find({REF_NO},(err,data)=>{
        
            res.render('post',{
                data:data
          
    })
})
})
app.post('/Delete',(req,res)=>{
    Student.deleteMany({ }).then(function(){
        console.log("Data deleted"); // Success
        res.render("Delete")
    }).catch(function(error){
        console.log(error); // Failure
    });
})
