const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors=require('cors');  //To avoid CORS errors
const jwt=require('jsonwebtoken');
const csurf=require('csurf');
const moment=require('moment');
const multer=require('multer');
const crypto=require('crypto');
const fs=require('fs');
const role=require('../public/javascripts/roles');


exports.module={
express:express,
path:path,
cookieParser:cookieParser,
logger:logger,
cors:cors,
jwt:jwt,
csurf:csurf,
moment:moment,
multer:multer,
crypto:crypto,
fs:fs,
role:role
}
