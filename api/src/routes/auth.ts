import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken"
import { User } from "../models/User";
import { config } from "../config/env";
import { Resend } from 'resend';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth'

const router: Router = Router()
const resend = new Resend(config.resendKey);
console.log('Resend email service ready');

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { email, password} = req.body

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' })
        return
    }

    try {
        const existing = await User.findOne({ email })
        if (existing) {
            res.status(409).json({ message: 'Email already registered' })
            return
        }

       
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const user = await User.create({ email, password, basicInfo: { basicInfoComplete: false }, verification: { code: String(verificationCode), 
            codeCreatedAt: Date.now(), emailVerified: false, eduVerified:false, verifiedAt: null  } }) 
        
        try {
                const { error } = await resend.emails.send({
                    from: 'noreply@uknighted.xyz',
                    to: email, 
                    subject: 'Verify Your Account - UKnighted MERN Demo',
                    html: `
                        <h2>Ready to look for love?</h2>
                        <p></p>
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

    if (!user.verification.codeCreatedAt || user.verification.codeCreatedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        res.status(400).json({ message: "Verification code has expired" });
        return;
    }
    
    if (user.verification.emailVerified) {
        res.status(409).json({ message: "Email already verified" });
        return;
    }

    // Compare as Number — matches schema type
    if (user.verification.code != verificationCode) {
        res.status(400).json({ message: "Invalid verification code" });
        return;
    }

    // Mark verified, clear the code
    user.verification.emailVerified = true;
    user.verification.verifiedAt = new Date();
    user.verification.code = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email },
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
            user: { id: user._id, email: user.email, basicInfo: { basicInfoComplete: user.basicInfo?.basicInfoComplete ?? false } }
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Server error'})
    }
})

router.patch('/complete-profile', authenticate, async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const { firstName, lastName, age, gender, major, classYear } = req.body

    if (!firstName || !lastName || !age || !gender || !major || !classYear) {
        res.status(400).json({ message: 'firstName, lastName, age, gender, major, and classYear are required' })
        return
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'basicInfo.firstName': firstName,
                    'basicInfo.lastName': lastName,
                    'basicInfo.age': age,
                    'basicInfo.gender': gender,
                    'basicInfo.major': major,
                    'basicInfo.classYear': classYear,
                    'basicInfo.basicInfoComplete': true   // 👈 flip the flag
                }
            },
            { new: true, runValidators: true }
        )

        if (!user || !user.basicInfo) { res.status(404).json({ message: 'User not found' }); return }

        res.json({
            message: 'Profile completed',
            user: {
                id: user._id,
                email: user.email,
                basicInfoComplete: user.basicInfo.basicInfoComplete
            }
        })
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message })
            return
        }
        console.error('Complete profile error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})
router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body

    if (!email) {
        res.status(400).json({ message: 'Email is required' })
        return
    }

    try {
        const user = await User.findOne({ email })

        if (!user || !user.verification) {
            res.status(404).json({ message: 'User not found' })
            return
        }

        if (user.verification?.emailVerified) {
            res.status(409).json({ message: 'Email is already verified' })
            return
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000)

        user.verification.code = String(verificationCode)
        user.verification.codeCreatedAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await user.save()

         const { error } = await resend.emails.send({
                    from: 'noreply@uknighted.xyz',
                    to: email, 
                    subject: 'Verify Your Account - UKnighted MERN Demo',
                    html: `
                        <h2>Ready to look for love?</h2>
                        <p></p>
                        <p>Your email: ${email}</p>
                        <p>Verification code:</p>
                        <h1 style="color: #4CAF50; letter-spacing: 5px;">${verificationCode}</h1>
                        <p>This code will expire in 24 hours.</p>
                    `
                });

        if (error) {
            console.error('Resend error:', error)
            res.status(500).json({ message: 'Failed to send verification email' })
            return
        }

        res.json({ message: 'Verification code resent. Please check your email.' })
    } catch (err) {
        console.error('Resend verification error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})


router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({ message: 'Email is required' })
            return
        }

        const user = await User.findOne({ email: email.trim() })

        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex')
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

            user.passwordResetToken = hashedToken
            user.passwordResetExpiry = new Date(Date.now() + 1000 * 60 * 30) // 30 min
            await user.save()

            const resetLink = `${config.clientUrl}/reset-password?token=${rawToken}`

            const { error } = await resend.emails.send({
                    from: 'noreply@uknighted.xyz',
                    to: email, 
                    subject: 'Reset Password Link - UKnighted MERN Demo',
                    html: `
                        <h2>Ready to look for love?</h2>
                        <p></p>
                        <p>We received a request to reset your password. Click the button below — it expires in 30 minutes.</p>
                        <p>Reset Link:</p>
                       <a href="${resetLink}" 
                        style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; letter-spacing: 1px;">
                    Reset Password
                     </a>
                        <p>This link will expire in 30 minutes.</p>
                    `
                });

                if (error) {
                console.error('Resend error:', error)
                res.status(500).json({ message: 'Failed to send verification email' })
                return
                }

            console.log('Reset link:', resetLink) // send email here with resetLink
        }

            res.json({
            message: 'If an account exists for that email, a reset link was sent.'
        })
    } catch (err) {
        console.error('Forgot password error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body

        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and newPassword are required' })
            return
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpiry: { $gt: new Date() }
        }).select('+password')

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' })
            return
        }

        user.password = newPassword
        user.passwordResetToken = null
        user.passwordResetExpiry = null
        await user.save()

        res.json({ message: 'Password reset successful' })
    } catch (err) {
        console.error('Reset password error:', err)
        res.status(500).json({ message: 'Server error' })
    }
});


export default router