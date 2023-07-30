const jwt = require("jsonwebtoken")
const Admins = require("../models/Admins");

let admin = async (req, res, next) =>{
    if(req.method == "OPTIONS"){
        return next()
    }

    try{
        /**
         * Отделяется токен от тела заголовка авторизации
         */
        const token = req.headers["authorization"].split(' ')[1] // "Bearer TOKEN"
        /**
         * Проверяется наличие токена. В случае отсутствия токена запрос прерывается и пользователю отправляется сообщение с ошибкой
         */
        if(!token){
            return res.status(401).json({code: -1, message: "Authenticate required"})
        }
        /**
         * Производится верификация токена. В случае успеха объект извлеченный из токена передается в параметр req.user
         * и продолжается выполнение пользовательского запроса
         * в случае если токен не прошол верификацию, то запрос прерывается и пользователю выдает сообщение с соответствующей ошибкой
         */
        try{
            const decoded = jwt.verify(token, process.env.jwtSecret)
            req.admin = decoded

            /**
             * Проверка наличие пользователя в базе данных
             * Если пользователь существует, то проверяется его активация
             * если пользователь деактивирован, то зппрос завершается и отправляется уведомление пользователю
             */
            const admin = await Admins.findOne({_id: decoded.userID})
            if(!admin){
                return res.status(400).json({code: -2, message: "User not found"});
            }

            next()
        }catch (e) {
            return res.status(401).json({code: -1, message: "Invalid API token"})
        }

    }catch (e){
        return res.status(401).json({code: -1, message: "Authenticate required"})
    }
}

module.exports = admin
