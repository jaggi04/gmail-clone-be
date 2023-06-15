var express = require("express");
var router = express.Router();
const {ObjectId} = require("mongodb")
var { mongodb, MongoClient, dbUrl } = require("../dbSchema");
var {hashPassword, hashCompare,createToken,verifyToken} = require("../Auth");


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});


router.post("/signup", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let user = await db.collection("users").find({ email: req.body.email });
    if (user.length > 0) {
      res.json({
        statusCode: 400,
        message: "User Already Exists",
      });
    } else {
      let hashedPassword = await hashPassword(req.body.password,req.body.cpassword);
      req.body.password= hashedPassword;
      req.body.cpassword = hashedPassword;

      let user = await db.collection("users").insertOne(req.body);
      res.json({
        statusCode: 200,
        message: "User SignUp Successfull",
      }); 
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});



router.post("/login", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = await hashCompare(req.body.password, user.password);
      if (compare) {
        let token  = await createToken(user.email,user.firstName,user.role  )
        res.json({
          statusCode: 200,
          role:user.role, 
          email: user.email,
          firstName: user.firstName,  
          token
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Invalid Password",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});



router.get("/primary", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let inbox = await db
      .collection("inbox")
      .find({ category: "primary" })
      .toArray();
    if (inbox)
      res.json({
        statusCode: 200,
        message: "Message Send Successfully",
        data: inbox,
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.get("/social", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let inbox = await db
      .collection("inbox")
      .find({ category: "social" })
      .toArray();
    if (inbox)
      res.json({
        statusCode: 200,
        message: "Message Send Successfully",
        data: inbox,
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.get("/promotion", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let inbox = await db
      .collection("inbox")
      .find({ category: "promotion" })
      .toArray();
    if (inbox)
      res.json({
        statusCode: 200,
        message: "Message Send Successfully",
        data: inbox,
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.post("/inboxmsg", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let inbox = await db.collection("inbox").insertMany(req.body);
    if (inbox)
      res.json({
        statusCode: 200,
        message: "Message Send Successfully",
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.post("/send", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let send = await db.collection("SendMsgList").insertOne(req.body);
    if (send)
      res.json({
        statusCode: 200,
        message: "Message Send Successfully",
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.get("/allsendmsglist", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let send = await db.collection("SendMsgList").find().toArray();
    if (send)
      res.json({
        statusCode: 200,
        message: "Successfully",
        data: send,
      });
  } catch {
    console.log(error);
    res.json({
      statusCode: 500,
      messgae: "Internal Server Error",
    });
  }
});

router.delete("/inboxdelete/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let del = await db.collection("inbox").find().toArray();
    if (del) {
      let dele = await db
        .collection("inbox")
        .deleteOne({ _id: ObjectId(req.params.id) });
      res.json({
        statusCode: 200,
        dele,
        message: "Message Delete Successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});


router.delete("/sendmsgdelete/:id", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Gmail");
    let del = await db.collection("SendMsgList").find().toArray();
    if (del) {
      let dele = await db
        .collection("SendMsgList")
        .deleteOne({ _id: ObjectId(req.params.id) });
      res.json({
        statusCode: 200,
        dele,
        message: "Message Delete Successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
});

router.post("/sendemail", function (req, res, next) {
  const nodemailer = require("nodemailer");

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "harmitsonani4@gmail.com", // generated ethereal user
        pass: "nocgrbfwymcigvxz", // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Harmit 👻" <harmitsonani4@gmail.com>', // sender address
      to: req.body.to, // list of receivers
      subject: req.body.subject, // Subject line
      html: req.body.message, // html body
    });

    if (info.messageId) {
      res.send("Email Sent");
    } else {
      res.send("Email Not Sent");
    }
  }

  main().catch(console.error);
});


router.post("/auth",verifyToken,async(req,res)=>{
  res.json({
    statusCode:200,
    message:req.body.purpose
  })
})


module.exports = router;
