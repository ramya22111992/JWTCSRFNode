const mod=require('./modules').module;

const corsOptions = {
  origin: 'http://localhost:4200',
  methods:['GET','POST','PUT','DELETE'],
  credentials: true  }

const indexRouter = require('./routes/index');

const app = mod.express();

// view engine setup
app.set('views', mod.path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(mod.logger('dev'));
app.use(mod.cors(corsOptions));
app.use(mod.express.json());
app.use(mod.express.urlencoded({ extended: false }));
app.use(mod.cookieParser());
app.use(mod.express.static(mod.path.join(__dirname, 'public')));


app.use(function(req,res,next)
{   
res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
next(); //dont forget this, else next route wont be called.      
})

app.use('/', indexRouter);


// error handler
app.use(function(err, req, res, next) {
 
  // render the error page
  if (err.code == 'EBADCSRFTOKEN') 
  {
console.log(err);
      res.status(403).send(false)
  }
  else
  {
      res.status(500).send(err.message); //This is for catching errors thrown by throw and next(err)
  }
});

app.listen(8080,function()
        {
            console.log("app listening on port 8080");
        })

module.exports = app;
