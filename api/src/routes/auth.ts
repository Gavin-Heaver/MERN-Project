import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken"
import { User } from "../models/User";
import { config } from "../config/env";
import { Resend } from 'resend';

const router: Router = Router()
const resend = new Resend(process.env.RESEND_API_KEY);
console.log('Resend email service ready');

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { email, password, displayName, basicInfo} = req.body

    if (!email || !password || !displayName || !basicInfo) {
        res.status(400).json({ message: 'All fields are required' })
        return
    }

    try {
        const existing = await User.findOne({ email })
        if (existing) {
            res.status(409).json({ message: 'Email already registered' })
            return
        }

       
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const user = await User.create({ email, password, displayName, basicInfo, verification: { verificationCode: verificationCode, 
            verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), emailVerified: false, eduVerified:false, verifiedAt: null  } }) 
        
        try {
                const { data, error } = await resend.emails.send({
                    from: 'noreply@uknighted.xyz',
                    to: email, 
                    subject: 'Verify Your Account - UKnighted MERN Demo',
                    html: `
                        <h2>Ready to look for love?</h2>
                        <p>Hello ${displayName},</p>
                        <p>Your email: ${email}</p>
                        <p>Verification code:</p>
                        <h1 style="color: #4CAF50; letter-spacing: 5px;">${verificationCode}</h1>
                        <p>This code will expire in 24 hours.</p>
                    `
                });
                 if (error) {
                    console.error('Resend error:', error);
                    await User.deleteOne({ _id: user._id });
                    res.status(500).json({ message: "Failed to send verification email" });
                    return;
                } else {
                    console.log('✅ Verification email sent');
                }
           } catch (emailError) {
                console.error('Email send failed:', emailError);
                await User.deleteOne({ _id: user._id });
                res.status(500).json({ message: "Failed to send verification email" });
    return;
}
        
        res.status(201).json({ message: "Registration successful. Please check your email for a verification code." })
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message })
            return
        }
        console.error('Register error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post("/verify", async (req: Request, res: Response): Promise<void> => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    res.status(400).json({ message: "Email and verification code are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.verification) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (!user.verification.verificationExpiry || user.verification.verificationExpiry < new Date()) {
        res.status(400).json({ message: "Verification code has expired" });
    return;
    }
    
    if (user.verification.emailVerified) {
        res.status(409).json({ message: "Email already verified" });
        return;
    }

    // Compare as Number — matches schema type
    if (user.verification.verificationCode !== Number(verificationCode)) {
        res.status(400).json({ message: "Invalid verification code" });
        return;
    }

    // Mark verified, clear the code
    user.verification.emailVerified = true;
    user.verification.verifiedAt = new Date();
    user.verification.verificationCode = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' })
        return
    }

    try {
        const user = await User.findOne({ email }).select('+password')
        if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return }

        const valid = await user.comparePassword(password)
        if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return }
        if (!user.verification?.emailVerified) {
            res.status(403).json({ message: "Please verify your email before logging in" });
            return;
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        )

        res.json({
            token,
            user: { id: user._id, email: user.email, displayName: user.displayName }
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Server error'})
    }
})

export default router