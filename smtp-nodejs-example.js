var express = require('express')
var bodyParser = require('body-parser')

var app = express();

var dotenv = require('dotenv');
dotenv.load();

var nodemailer = require('nodemailer');
var smtpapi    = require('smtpapi');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname))
app.use(express.static(__dirname + '/demo'))
app.use(bodyParser.urlencoded({ extended: false }))

var sendgrid_username   = process.env.SENDGRID_USERNAME;
var sendgrid_password   = process.env.SENDGRID_PASSWORD;
var to                  = process.env.TO;

// Build the smtpapi header
var header = new smtpapi();
header.addSubstitution('%how%', ['Owl']);

// Add the smtpapi header to the general headers
var headers    = { 'x-smtpapi': header.jsonString() };

// Use nodemailer to send the email
var settings  = {
  host: "smtp.sendgrid.net",
  port: parseInt(587, 10),
  requiresAuth: true,
  auth: {
    user: sendgrid_username,
    pass: sendgrid_password 
  }
};
var smtpTransport = nodemailer.createTransport(settings);



app.get('/', function(request, response) {
  response.render('index.html')
})

app.post('/sendmail', function(request, response){

    var mailOptions = {
      from:     request.body.from,
      to:       request.body.to,
      subject:  request.body.subject,
      text:     request.body.content,
      html:     "<strong>"+request.body.content+"</strong>",
      attachments: { 
        path: './gif.gif',
        filename: 'owl.gif' 
      },
      headers:  headers
    }

    smtpTransport.sendMail(mailOptions, function(error, res) {
      smtpTransport.close();

      if (error) { 
        console.log(error);
        response.send(error);
      } 
      else {
          var obj = {
            "msg":"Message sent",
            "Accepted":res.accepted,
            "Rejected":res.rejected,
            "Response":res.response,
            "Envelope":JSON.stringify(res.envelope),
            "MessageId":res.messageId
          }
          console.log(obj);
          response.send(obj);
      }
    });


});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
