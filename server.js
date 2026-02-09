const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");


const app = express()


app.use(cors())
app.use(express.json())


mongoose.connect("mongodb+srv://neevithaa_db_user:3MsnIQZCSoSBgPXO@cluster0.pcvunb7.mongodb.net/bulkmail?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


const emailHistorySchema = new mongoose.Schema({
  message: String,
  emailList: [String],
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EmailHistory = mongoose.model("EmailHistory", emailHistorySchema);
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: "neevithaa@gmail.com",
    pass: "tkiz jpst gyzp bayd",
  },
});

const emailTemplate = (message, recipient) => ({
    from: "neevithaa@gmail.com",
    to: recipient,
    subject: 'You get Text Message from Your App!',
    text: message
  });

const sendMails = ({ message, emailList }) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const recipient of emailList) {
        const mailOptions = emailTemplate(message, recipient);
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}`);
      }

      await EmailHistory.create({
        message,
        emailList,
        status: "Success"
      });

      resolve("Success");
    } catch (error) {
      console.error("Error sending emails:", error.message);

      await EmailHistory.create({
        message,
        emailList,
        status: "Failed"
      });

      reject(error.message);
    }
  });
};


app.post("/sendemail", function (req, res) {
  sendMails(req.body)
    .then(() => res.send(true))
    .catch(() => res.send(false));
});

app.get("/email-history", async (req, res) => {
  try {
    const history = await EmailHistory.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});


app.listen(5000,function(){
    console.log("Server Started.....")
})