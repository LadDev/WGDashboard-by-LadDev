const express = require('express'); // Import express module
const app = express(); // Create express app

const cors = require('cors')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const { config } = require('dotenv')
config()

const mongoose = require("mongoose");
const Admins = require("./models/Admins")
const GlobalConfig = require("./models/GlobalConfig")
const bcrypt = require("bcryptjs")
const {exec} = require("child_process");
const {updateEnvVariable} = require("./middleware/WireGuardConf");
const path = require('path');

app.use(cors())

app.use(fileUpload({}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({limit: "500mb"}));
app.use(bodyParser.urlencoded({limit: "500mb", extended: true, parameterLimit:5000}));

app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'LadDev Apps')
    next()
})

app.use("/api", require("./routes/app.routes"))

//app.use('/client-api/avatars', express.static('loadedAvatars'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



const API_PORT = process.env.API_PORT || 10085

function executeCurlCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function start(){
    try{
        mongoose.set('strictQuery', false);
        // Устанавливаем соединение с базой данных MongoDB
        await mongoose.connect(process.env.DATABASE, {
            useUnifiedTopology: true,
        })

        //updateEnvVariable("WG_CONF_PATH","/etc/wireguard/")

        const gc = await GlobalConfig.find({})
        if(!gc || gc.length === 0){
            console.log("GlobalConfig not found. Creating admin user...")
            const me = await executeCurlCommand('curl ifconfig.me')
            const newGC = new GlobalConfig({
                ip: me,
                path: process.env.WG_CONF_PATH
            })
            updateEnvVariable("SERVER_ADDR",me)

            await newGC.save()
        }

        const admin = await Admins.findOne({});


        if(!admin){
            console.log("Admins not found. Creating admin user...")
            const hashed_pwd = await bcrypt.hash("admin", 12);
            const newAdmin = new Admins({
                username: "admin",
                password: hashed_pwd
            })
            await newAdmin.save()
        }


        // Запускаем сервер приложения на определенном порту
        app.listen(API_PORT, () => {
            console.log(`Server admin app has bin started on port ${API_PORT}`)
        })
    }catch (e){
        // В случае ошибки выводим сообщение об ошибке в консоль
        console.log("Server Error:", e.message)
        process.exit(0)
    }
}

start()
