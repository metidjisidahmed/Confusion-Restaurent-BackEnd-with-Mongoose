const cors = require('cors');
const whiteList = ['http://localhost:3000', 'https://localhost:3443' , 'http://localhost:5000'];


module.exports.cors = cors();
module.exports.corsWithOptions=cors((req, callback) => {
        const whiteList = ['http://localhost:3000', 'https://localhost:3443' , 'http://localhost:5000' , 'http://localhost:5000'];
        let origin;
        if(whiteList.indexOf(req.header('Origin'))===-1){
            origin = false
        }else{
            origin = true;
        }
        callback(null , {origin: origin})
});