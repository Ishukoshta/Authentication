import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModels.js';
import transporter from '../config/nodeMAiler.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';


// register user
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        const userExist = await userModel.findOne({ email })
        if (userExist) {
            return res.json({ success: false, message: "User already exists" })
        }
        const hashedPAssword = await bcrypt.hash(password, 10)

        const user = new userModel({
            name, email, password: hashedPAssword
        })
        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome',
            text: `Welcome , Your account is created ${email}`
        }
        await transporter.sendMail(mailOptions)
        return res.json({ success: true })

    } catch (error) {
        res.json({ success: false, message: error.message })

    }

}



// login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Both fields are required" })
    }

    try {

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "Invalid email" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



// logot user 
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true, mesaage: "Logged out" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



// verification otp to user Email
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (user.isAccountVerifiedAt) {
            return res.json({ success: false, message: "Account is already verified" })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Verification OTP sent on Email" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// verify email using otp
export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing Details' })
    }
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' })

        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' })
        }
        user.isAccountVerifiedAt = true;
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0;

        res.json({ success: true, message: "Email verified successfully" })
        await user.save()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// check if user is  authenthicated
export const isAuthenticated = async (req, res) => {
    try {
        res.json({ success: true, message: "User Authenticated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// send password reset OTP
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' })
    }

    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, mesaage: 'User not found' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP is for resetting your password is ${otp}.`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'OTP sent to yuor email' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Fields are required' })
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, mesaage: 'User not found' });
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, mesaage: 'Invalid OTP' })
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' })
        }
        const hashedPAssword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPAssword
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save()
        return res.json({ success: true, message: 'Password had' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}