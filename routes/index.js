const mod=require('../modules').module;
const router = mod.express.Router();
const privateKey=mod.fs.readFileSync('./public/keys/private.key','utf8');//To sign the payload


function customValue(req)
{
  return req.headers['x-xsrf-token'];
}

const csrfProtection = mod.csurf({ cookie:{httpOnly:true},value:customValue}); //cookie parser needed

const productImageUpload=mod.multer({storage:mod.multer.diskStorage({

  destination:function(req,file,fun)
  {
      fun(null,'./public/images/products'); //set the destination path
  },
  filename:function(req,file,fun)
  {
console.log(file);
         fun(null,file.originalname); //set the destination filename
  }
  })}).single('uploads');


const AdminAuthFunc=require('../public/javascripts/Auth').auth.IsAdminAuthenticated();
const UserAuthFunc=require('../public/javascripts/Auth').auth.IsUserAuthenticated();


router.get('/',csrfProtection,function(req,res,next)
        {
            const token=req.csrfToken();
           
            res.cookie("XSRF-TOKEN",token,{httpOnly:false,secure:false});
            res.status(200).send();
        })
        
router.get('/IsLoggedIn',function(req,res,next)
        {
        const date=new Date().getTime();
        const expired= mod.moment(date).isBefore(req.cookies.expiry);
        if(!expired)
        {
            res.status(401).send(false);  
        }
        else
        {
            res.status(200).send(true);
        }
        });
        
        
        
        
router.post('/login',csrfProtection,function(req,res,next)
        {
        const user=req.body.username;
        const pass=req.body.password;
        let tokenData="";
        let csrfToken="";
        
        
        mod.fs.readFile('./public/users/users.json',"utf8",function(err,data)
        {
            if(err) next(err); //Since it is async, we call next(err)
            let Userdata=JSON.parse(data);
            let filteredData=Userdata.filter(x=>x.credentials.username==user && x.credentials.password==pass);
         
            if(filteredData.length > 0)
            {
                let role=filteredData[0].credentials.role;
                csrfToken=req.csrfToken();
                //sign the payload using the private key and generate the token
                mod.jwt.sign({user:user,role:role,csrfToken:csrfToken},privateKey,{
                  subject:user,  //intended user of the token
                  algorithm:"RS256",//signing algorithm
                  expiresIn:  "60000"   //token expires in 1 min,
            
                },function(err,token)
                {
                if (err) throw err;
               tokenData=token;
                })
            
               let clear=setInterval(()=>{
                    if(tokenData !=="")
                    {
                        let date=new Date();
                        date.setTime(date.getTime()+60000);
                        clearInterval(clear);
                        res.cookie('sessionId',tokenData,{httpOnly:true,secure:false});
                        res.cookie('user',user,{httpOnly:true,secure:false});
                        res.cookie('expiry',date.toUTCString(),{httpOnly:true,secure:false});
                        res.cookie("XSRF-TOKEN",csrfToken,{httpOnly:false,secure:false});
                        res.status(200).send();
                    }
                },1000) 
            }
            else
            {
                res.status(401).send();
            }
        
        
        })
        
         
        })
        
        //Routes to be handled only by admin
        
        
        router.post('/addProduct',AdminAuthFunc,function(req,res,next)
        {
        productImageUpload(req,res,function(err)
            {
        
                mod.fs.readFile('./public/users/products.json',"utf8",function(err,data)
                {
                if(err) throw err;
                
                let productData=JSON.parse(req.body["productDetails"]);
                productData.imgUrl="http://localhost:8080/images/products/"+productData.productID;
                productData.productID=productData.productID.substring(0,productData.productID.lastIndexOf("."))
            
                let productList=JSON.parse(data);
                productList.push(productData);
                
                
                mod.fs.writeFile('./public/users/products.json',JSON.stringify(productList),function(err)
                {
                    if(err) throw err;
                
                    res.status(200).send();
                })
                
                })
        
        
                if (err instanceof mod.multer.MulterError) {
                    console.log(err);
                  } else if (err) {
                      console.log(err);
                  }
        
            })
        
        
            
        })
        
        router.get('/productID',AdminAuthFunc,function(req,res,next)
        {
            res.status(200).send(mod.crypto.randomBytes(8).toString('hex'));
        })
        
        router.get('/getProducts',UserAuthFunc,function(req,res,next)
        {
        
            mod.fs.readFile('./public/users/products.json',"utf8",function(err,data)
            {
            if(err) throw err;
            
            res.status(200).send(JSON.parse(data));
            
            })
                
        
        
        })

module.exports = router;
