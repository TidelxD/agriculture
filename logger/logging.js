function log1(req,res,next){
console.log('Log 1 ');
next();

}
function log2(req,res,next){

    console.log('Log 2 ');
    next();
}



module.exports = log1
module.exports = log2