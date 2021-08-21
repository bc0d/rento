// server.js
// load the things we need
var express = require('express');
var path = require('path');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
var mysql = require('mysql');
var moment = require('moment');
const fileUpload = require('express-fileupload');

var connection = mysql.createConnection(
    {
        host : 'localhost',
        user : 'root',
        password : '',
        database : 'rento'
    }
);

app.use(session( {
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
connection.connect(function(err) {
    if(err) throw err;
    console.log("db connected");
});
global.db = connection;
// set the view engine to ejs
app.set('view engine', 'ejs');
// use res.render to load up an ejs view file
// index page 
// app.get('/', function(req, res) {
//     res.render('index');
// });
app.set('views',path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({ 
    extended : false
}));
app.use(bodyparser.json());
app.use(fileUpload());
app.use( express.static( "uploads" ) );

// **************************************  CLIENT SIDE STARTED HERE *********************************** //
// **************************************  CLIENT SIDE *********************************** //
// **************************************  CLIENT SIDE *********************************** //

//index
app.get('/', function(req, res) {
    var user_cat = req.session.user_cat;
    connection.query('SELECT * FROM temp_pdt', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        res.render('index', {
            pdtlist:results,
            usrcat:user_cat
        });
    });
});
//register
app.get('/register-first', function(req, res) {
    res.render('register-first');
});
app.get('/register-second', function(req, res) {
    res.render('register-second');
});
//log in
app.get('/login', function(req, res) {
    res.render('login');
});
//my profile
app.get('/usrpro', function(req, res) {
    var user_cat = req.session.user_cat;
    var usr_id = req.session.user_id;
    var uid = req.query.uid;
    if (!uid) {
        uid = 0;
    }
    if ((user_cat != 'r')&&(user_cat != 'b')) {
        res.redirect('/login');    
    }
    connection.query('SELECT * FROM temp_user WHERE ?', {user_id : usr_id}, function(error, results, fields) {
        if (error) {
            console.log('eee');
            return console.error(error.message);
        }
        if (user_cat == 'r') {
            connection.query('SELECT * FROM temp_pdt WHERE renter_id='+usr_id, function(error, results1, fields) {
                if (error) {
                    console.log('eee');
                    return console.error(error.message);
                }
                console.log(usr_id);
                console.log(results);
                res.render('usrpro', {
                    user:results,
                    pdtlist:results1,
                    usrcat:user_cat,
                    uid:uid
                });
            });
        }
        else {
            
            console.log(usr_id);
            console.log(results);
            res.render('usrpro', {
                user:results,
                usrcat:user_cat
            });
        }
    });
});
//view profile
app.get('/viewpro', function(req, res) {
    var uid = req.query.uid;
    connection.query('SELECT * FROM temp_user WHERE ?', {user_id : uid}, function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        connection.query('SELECT * FROM temp_pdt WHERE renter_id = '+uid, function(error, results1, fields) {
            if (error) {
                return console.error(error.message);
            }
            console.log(results);
            res.render('viewpro', {
                user:results,
                pdtlist:results1
            });
        });
    });
});
//notification
app.get('/notification', function(req, res) {
    var user_cat = req.session.user_cat;
    var usr_id = req.session.user_id;
    if ((user_cat != 'r')&&(user_cat != 'b'))  {
        res.redirect('/login');    
    }
    if(user_cat == 'r'){
        connection.query('SELECT * FROM transaction WHERE renter_id='+usr_id+' ORDER BY order_date DESC', function(error, resultr, fields) {
            console.log(usr_id);
            console.log(resultr);
            res.render('notification', {
                usrcat:user_cat,
                trans:resultr
            });
        });
    }
    else if(user_cat == 'b') {
        var sql=
        connection.query('SELECT * FROM transaction WHERE buyer_id='+usr_id+' ORDER BY order_date DESC', function(error, resultb, fields) {
            res.render('notification', {
                usrcat:user_cat,
                trans:resultb
            });
        });
    }
});
// product add form  
app.get('/prodadd', function(req, res) {
    var user_cat = req.session.user_cat;
    var usr_id = req.session.user_id;
    console.log(user_cat);
     console.log(usr_id);
    if (user_cat != 'r')  {
        res.redirect('/login');    
    }
    res.render('prodadd',{
        usrcat:user_cat
    });
});
app.get('/prodconfir', function(req, res) {
    res.render('prodconfir');
});

//products display
app.get('/categoryProdDisplay', function(req, res) {
    var user_cat = req.session.user_cat;
    var prod_cat = req.query.cat;
    var qry = connection.query('SELECT * FROM temp_pdt WHERE category="'+prod_cat+'" and status=0', function(error, results, fields) {
        console.log(qry.sql);
        if (error) {
            return console.error(error.message);
        }
        var no = results.length;
        console.log(results);
        console.log(no);
        res.render('proddisplay', {
            pdtlist:results,
            no:no,
            usrcat:user_cat
        });
    });
});

//products display
app.get('/proddisplay', function(req, res) {
    var user_cat = req.session.user_cat;
    connection.query('SELECT * FROM temp_pdt WHERE status=0', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        var no = results.length;
        console.log(results);
        console.log(no);
        res.render('proddisplay', {
            pdtlist:results,
            no:no,
            usrcat:user_cat
        });
    });
});
//product page
app.get('/product', function(req, res) {
    var id = req.query.id;
    connection.query('SELECT * FROM temp_pdt WHERE prod_id = '+id, function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        connection.query('SELECT * FROM temp_user WHERE ?', {user_id:results[0].user_id}, function(error, resusr, fieldss) {
            var qcmt = "SELECT * FROM comment WHERE prod_id ="+id;
            console.log(qcmt);
            connection.query(qcmt, function(error, rescmt, field) {
                console.log(results);
                console.log(resusr);
                res.render('product', {
                    prodt:results,
                    name:resusr,
                    cmt:rescmt
                });
            });
        });
    });
});
//product cart
app.post('/prodcart', function(req, res) {
    var user_cat = req.session.user_cat;
    var pid = req.body.pid;
    var rnt_prd = req.body.rent_prd;
    if ((user_cat != 'r')&&(user_cat != 'b'))  {
        res.redirect('/login');    
    }
    connection.query('SELECT * FROM temp_pdt WHERE ?', {prod_id:pid}, function(error, result, fields) {
        if (error) {
            return console.error(error.message);
        }
        res.render('prodcart', {
            pdtcart:result,
            rnt_prd:rnt_prd
        });
    });
});
//message
app.get('/rentmsg', function(req, res) {
    var id = req.body.rid;//id undifined
    console.log('this is user id'+id);
    var qry = connection.query('SELECT * FROM temp_user WHERE ?', {user_id:id}, function(error, result, field) {
        console.log(qry.sql);
        res.render('rentmsg', {
            renter:result
        });
    });
});
//transaction
app.post('/renttrans', function(request, response) {
    var user_cat = request.session.user_cat;
    var usr_id = request.session.user_id;
    var pid = request.body.pid;
    var rntprd = request.body.rent_prd;
    if ((user_cat != 'r')&&(user_cat != 'b'))  {
        res.redirect('/login');    
    }
    connection.query('SELECT * FROM temp_pdt WHERE ?', {prod_id : pid}, function(error, pdt, fields) {
        var odr_date = moment(Date.now()).format('YYYY-MM-DD');
        var rntamt = pdt[0].rent_amt;
        var amt = rntprd*rntamt;
        console.log(pdt[0].renter_id);
        var q3 = {
            prod_id : pid,
            prod_name : pdt[0].pdt_name,
            category : pdt[0].category,
            renter_id : pdt[0].renter_id,
            rent : pdt[0].rent_amt,
            buyer_id : usr_id,
            rent_period : rntprd,
            order_date : odr_date,
            amount : amt
        };
            var rid = pdt[0].renter_id;

        var qry = connection.query('INSERT INTO transaction SET ?', q3, function(error, result) {
            console.log(qry.sql);
            console.log(result.insertId);
             var qry1 = connection.query('SELECT * FROM temp_user WHERE ?', {user_id:rid}, function(error, resultt, field) {
        console.log(qry1.sql);
  
            response.render('rentmsg', {// error anonymous query
                rid:rid,renter:resultt//error passing
            });
            });
        });    
    });
});

//delete
app.get('/delete', function(req, res) {
    var delid = req.query.id;
    var delqry="DELETE FROM temp_pdt WHERE prod_id="+delid;
    connection.query(delqry, function(error, result) {
        res.redirect('usrpro');
    })
})
//edit
app.get('/edit', function(req, res) {
    var eid = req.query.pid;
    console.log(eid);
    var sql = "SELECT * FROM temp_pdt WHERE prod_id="+eid;
    connection.query(sql, function(error, result, fields) {
        console.log(sql);
        res.render('prodedit', {
            pid:eid,
            old:result
        });
    });
});
//comment section
app.post('/comment', function(request, response) {
    var user_cat = request.session.user_cat;
    var usr_id = request.session.user_id;
    if (user_cat != 'r' && user_cat != 'b')  {
        response.redirect('/login');   
        return false;
    }
    var tym = moment(Date.now()).format('MMMM Do YYYY, h:mm:ss');
    var cmt = request.body.cmt;
    var pid = request.body.idp;
    console.log(cmt);
    console.log(pid);
    var qr = {
        prod_id : pid,
        user_id : usr_id,
        c_time : tym,
        cmt : cmt
    };
    connection.query('INSERT INTO comment SET ?', qr, function(error, result) {
        console.log(result.insertId);
        response.redirect('/');
    });
});



app.post('/search', function(req, res) {
    //res.render('him');
var searchval =req.body.search;
        var user_cat = req.session.user_cat;
    connection.query('SELECT * FROM temp_pdt WHERE pdt_name like "%'+searchval+'%"  and  status=0', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        var no = results.length;
        console.log(results);
        console.log(no);
        res.render('proddisplay', {
            pdtlist:results,
            no:no,
            usrcat:user_cat
        });
    });    
});


// **************************************  ADMIN SIDE STARTED HERE *********************************** //

// **************************************  ADMIN SIDE *********************************** //

// **************************************  ADMIN SIDE *********************************** //

//index
app.get('/web-admin', function(req, res) {
    res.render('admin/page-login');
});
app.get('/admin-index', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    var q1 = connection.query('SELECT * FROM temp_user', function (error, result) {
        if (error) {
            return console.error(error.message);
        }
        console.log(q1.sql);
        var q2 = connection.query('SELECT * FROM temp_pdt', function (err, reslt) {
            if (err) {
                return console.err(err.message);
            }
            console.log(q2.sql);
            var q3 = connection.query('SELECT * FROM transaction', function (eror, res2) {
                if (eror) {
                    return console.eror(eror.message);
                }
                console.log(q3.sql);
                var usr = result.length;
                console.log(usr);
                var pdt = reslt.length;
                console.log(pdt);
                var tran = res2.length;
                console.log(tran);
                res.render('admin/index', {
                    usr1:usr,
                    pdt1:pdt,
                    tran1:tran
                });
            });
        });
    });
});
//form
//registration form
app.get('/page-register', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    res.render('admin/page-register');
});
//registration form
app.get('/page-register-2nd', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    res.render('admin/page-register-2nd');
});
//forget password
app.get('/pages-forget', function(req, res) {
    res.render('admin/pages-forget');
});
//product table
app.get('/table-prod', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    connection.query('SELECT * FROM temp_pdt', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        res.render('admin/table-prod', {
            prod:results
        });
    });
});
//user table
app.get('/table-user', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    connection.query('SELECT * FROM temp_user', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        res.render('admin/table-user', {
            usr:results
        });
    });
});
//transaction table  
app.get('/table-trans', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    
    
    connection.query('SELECT * FROM transaction', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        res.render('admin/table-trans', {
            trans:results
        });
    });
});

//add item form
app.get('/form-add', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    res.render('admin/form-add');
});
//aproval
//product
app.get('/aprove', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');   
    }
    connection.query('SELECT * FROM temp_pdt', function(error, results, fields) {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        res.render('admin/aprove', {
            pdt:results
        });
    });
});
//user
app.get('/formcat', function(req, res) {
    var user_cat = req.session.user_cat;
    if (user_cat != 'a') {
        res.redirect('/web-admin');
    }
    res.render('admin/formcat');
});
//aprov
app.post('/aprov', function(request, response) {
    var status = request.body.status;
    var id = request.body.pid;
    var a = {
        status : status
    };
    console.log(id);
    connection.query('UPDATE temp_pdt SET ? WHERE prod_id = ?',[a, id]);
})

//******************************************************************
//**********************mutual functions*************************


//post method addform
app.post('/test', function(request, response){
    var user_cat = request.session.user_cat;
    var usr_id = request.session.user_id;
    var catogery = request.body.cate;
    var name = request.body.prod_name;
    var desc = request.body.prod_desc;
    var inst = request.body.prod_instr;
    var maxrp = request.body.rent_prid;
    var rentamt = request.body.rent_amt;
    var rentpr = request.body.rent_per;
    var pic1 = request.body.prod_img1;
    var pic2 = request.body.prod_img2;
    var pic3 = request.body.prod_img3;
    var pic4 = request.body.prod_img4;
    var pikup = request.body.prod_pik;
    var eid = request.body.pid;
    console.log('---------------------'+eid);
    console.log(request.body);
    //error uploading
    if(eid == 0) {
        if (!request.files || Object.keys(request.files).length === 0) {
            return response.status(400).send('No files were uploaded.');
        }
        var imgfile1 = request.files.prod_img1.name;
        let img1 = request.files.prod_img2;
        var imgdate1 = imgfile1 + '-' + Date.now();
        var imgfol1 ='./uploads/'+imgdate1+'.jpg';
        var imgname1 = imgdate1+'.jpg';
        img1.mv(imgfol1, function(err) {
            if (err)
                return response.status(500).send(err);
        });
        var imgfile2 = request.files.prod_img2.name;
        let img2 = request.files.prod_img2;
        var imgdate2 = imgfile2 + '-' + Date.now();
        var imgfol2 ='./uploads/'+imgdate2+'.jpg';
        var imgname2 = imgdate2+'.jpg';
        img2.mv(imgfol2, function(err) {
            if (err)
                return response.status(500).send(err);
        });
        
        var imgfile3 = request.files.prod_img3.name;
        let img3 = request.files.prod_img3;
        var imgdate3 = imgfile3 + '-' + Date.now();
        var imgfol3 ='./uploads/'+imgdate3+'.jpg';
        var imgname3 = imgdate3+'.jpg';
        img3.mv(imgfol3, function(err) {
            if (err)
                return response.status(500).send(err);
        });
        
        var imgfile4 = request.files.prod_img4.name;
        let img4 = request.files.prod_img4;
        var imgdate4 = imgfile4 + '-' + Date.now();
        var imgfol4 ='./uploads/'+imgdate4+'.jpg';
        var imgname4 = imgdate4+'.jpg';
        img4.mv(imgfol4, function(err) {
            if (err)
                return response.status(500).send(err);
        });
        
        console.log(request.body);
        var q = {
            pdt_name : name,
            category : catogery,
            renter_id: usr_id,
            max_rent_prd : maxrp,
            rent_amt : rentamt,
            rent_per : rentpr,
            descr : desc,
            instr : inst,
            pic1 : imgname1,
            pic2 : imgname2,
            pic3 : imgname3,
            pic4 : imgname4,
            pickup_point : pikup
        };    
        var qry = connection.query('UPDATE temp_pdt SET ? WHRE prod_id=?', [q,eid], function(error,result) {
            console.log(qry.sql);
            console.log('athul');
            console.log(result.insertId);
            connection.query('SELECT * FROM temp_pdt WHERE ?',{prod_id:result.insertId}, function(error, res, fields) {
                console.log(res);
                console.log(user_cat);
                if (user_cat == 'r') {
                    response.render('prodconfir', {
                        pdt_dts:res
                    });
                }
                else if (user_cat == 'a') {
                    response.redirect('admin-index');
                }
            });
        });
        
    }
    else {
        var pid = request.body.pid;
        var sts = request.body.status;
        console.log(request.body);
        var q = {
            pdt_name : name,
            category : catogery,
            renter_id: usr_id,
            max_rent_prd : maxrp,
            rent_amt : rentamt,
            rent_per : rentpr,
            descr : desc,
            instr : inst,
            pickup_point : pikup,
            status : sts
        };    
        connection.query('INSERT INTO temp_pdt SET ?', q, function(error,result) {
            console.log(result.insertId);
            connection.query('SELECT * FROM temp_pdt WHERE ?',{prod_id:result.insertId}, function(error, res, fields) {
                console.log(res);
                console.log(user_cat);
                if (user_cat == 'r') {
                    response.render('prodconfir', {
                        pdt_dts:res
                    });
                }
                else if (user_cat == 'a') {
                    response.redirect('admin-index');
                }
            });
        });
    }
});


//registration and login start here
//post method page-register
app.post('/register',function(request, response){
    var fname = request.body.fname;
    var sname = request.body.sname;
    var email = request.body.mail;
    var phone = request.body.phone;
    var password = request.body.cpass;
    console.log(request.body);
    var q1 = {
        f_name : fname,
        s_name : sname,
        mail : email,
        ph_no : phone,
        password : password
    };
    connection.query('INSERT INTO temp_user SET ?', q1, function(err, result) {
        if (err) throw err;
        console.log(result.insertId);
        var uid = result.insertId;
        response.render('register-second', {
            userid: uid
        });
    });
});
//post page register 2
app.post('/register2',function(request, response){
    var usrpic = request.body.user_pic;
    var idpic1 = request.body.id_front;
    var idpic2 = request.body.id_back;
    var adrs = request.body.address;
    var priv = request.body.user_cat;
    var id = request.body.id;
    console.log(request.body);
    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).send('No files were uploaded.');
    }
    var filenameusr = request.files.user_pic.name;
    let Fileusr = request.files.user_pic;
    var dnameusr = filenameusr + '-' + Date.now();
    var fnameusr ='./uploads/'+dnameusr+'.jpg';
    var imgnameusr = dnameusr+'.jpg';
    Fileusr.mv(fnameusr, function(err) {
        if (err)
            return response.status(500).send(err);
    });
    var filenameidf = request.files.id_front.name;
    let Fileidf = request.files.id_front;
    var dnameidf = filenameidf + '-' + Date.now();
    var fnameidf ='./uploads/'+dnameidf+'.jpg';
    var imgnameidf = dnameidf+'.jpg';
    Fileidf.mv(fnameidf, function(err) {
        if (err)
            return response.status(500).send(err);
    });
    var filenameidb = request.files.id_back.name;
    let Fileidb = request.files.id_back;
    var dnameidb = filenameidb + '-' + Date.now();
    var fnameidb ='./uploads/'+dnameidb+'.jpg';
    var imgnameidb = dnameidb+'.jpg';
    Fileidb.mv(fnameidb, function(err) {
        if (err)
            return response.status(500).send(err);
    });
    var q2 = {
        user_pic : imgnameusr,
        id_pic1 : imgnameidf,
        id_pic2 : imgnameidb,
        address : adrs,
        privilege : priv
    };
    connection.query('UPDATE temp_user SET ? WHERE user_id = ?', [q2, id], function(err, result) {
        if (err) throw err;
        response.redirect('/login');
    });
});
//registration end here

//post login
app.post('/auth', function(request, response) {
    var mail = request.body.mail;
    var pass = request.body.pass;
    if (mail && pass) {
        connection.query('SELECT * FROM temp_user WHERE mail = ? AND password = ?', [mail, pass], function(err, result, fields) {
            if (result.length > 0) {
                console.log(result);
                Object.keys(result).forEach(function(key) {
                    var row = result[key];
                    request.session.user_id = row.user_id;
                    request.session.user_cat = row.privilege;
                    request.session.name = row.f_name;
                })
                if (request.session.user_cat == 'a') {
                    request.session.loggedin = true;
                    response.redirect('/admin-index');
                }
                else if (request.session.user_cat == 'r') {
                    request.session.loggedin = true;
                    response.redirect('/');
                }
                else if (request.session.user_cat == 'b') {
                    request.session.loggedin = true;
                    response.redirect('/');
                }
            }
            else {
                response.send('loggin denied');
            }
            response.end();
        });
    }
    else {
        response.send('enter mail and password');
        response.end();
    }
});

//logout
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
})

app.listen(8080);
console.log('8080 is the magic port');