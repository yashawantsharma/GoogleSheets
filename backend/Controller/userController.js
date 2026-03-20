const user = require("../Model/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");



function generatePassword(length = 4) {
    const chars = "0123456789";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

// console.log(generatePassword());

exports.register = async (req, res) => {
    try {
        // console.log(req.body);
        const { name, email, phone, gender,password } = req.body;
        console.log("dfghj>>>>>>>>>>",req.body);
           if (!(name && email && phone && gender && password)) {
  return res.status(400).json({ message: "All input are required" });
}
        const userExist = await user.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" })
        }
    //    const password = generatePassword();
         const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt);
        const data = { name, email, phone, password: hash, gender}
        
        
        const newUser = new user(data);
        await newUser.save();
         const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENT_EMAIL,
                pass: process.env.SENT_PASS,
            },
        });


        const info = await transporter.sendMail({
            from: process.env.SENT_EMAIL,
            to: email,
            subject: "Account Created successfully",
            html: `
    <p>Hello <b>${name}</b>,</p>

    <p>
      Your account has been created with the following details:
    </p>

    <p>
      <b>Email:</b> ${email}<br/>
      <b>Phone:</b> ${phone}<br/>
      <b>Password:</b> ${password}
    </p>

    <p>
      Please change your password after login.
    </p>

    <p>
      Thanks,<br/>
    </p>
  `,

        });
       res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(req.body);
        
          if (!(email && password)) {
            return res.status(400).json({ message: "all input are required" });
        }
        const existinguser = await user.findOne({ email });
        
        if (!existinguser) {
            return res.status(404).json({ message: "User not found" })
        }
        // console.log(password);
        // console.log(existinguser.password);
        
        const isMatch = await bcrypt.compare(password, existinguser.password);

        if (isMatch) {
            const token = jwt.sign(
                { id: existinguser._id, role: existinguser.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            )

        res.status(200).json({ message: "Login successful", token: token,
                user: {
                    id: existinguser._id,
                    name: existinguser.name,
                    email: existinguser.email,
                    role: existinguser.role 
                } })
    }
}
    catch (error) {
         console.log("LOGIN ERROR 🔥", error);  
        res.status(500).json({ message: "Server error", error: error.message })
    }   
}

