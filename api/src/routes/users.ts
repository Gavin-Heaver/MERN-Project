import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { uploadPhoto, deletePhoto } from "../lib/uploadPhoto";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true)
        else cb(new Error('Only image files are allowed'))
    }
})

const Interaction = require('../models/Interaction');

const router: Router = Router();

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// We can just update the existing profile fields with the other routes instead of 
// having this one, just leaving it here just in case

// router.put('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { bio, age, major, year } = req.body;

//         const updateData: any = {};
//         if (bio !== undefined) updateData.bio = bio;
//         if (age !== undefined) updateData.age = age;
//         if (major !== undefined) updateData.major = major;
//         if (year !== undefined) updateData.year = year;

//         const user = await User.findByIdAndUpdate(
//             req.user?.id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password');

//         if (!user) {
//             res.status(404).json({ message: 'User not found' });
//             return;
//         }

//         res.json({ user });
//     } catch (err) {
//         console.error('Update profile error:', err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/discover', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user?.id);

        // Get current user's preferences and basicInfo
        const currentUser = await User.findById(currentUserId).select('preferences basicInfo');
        if (!currentUser?.preferences || !currentUser?.basicInfo) {
            res.status(400).json({ message: 'Complete your profile and preferences first' });
            return;
        }

        const { ageMin, ageMax, interestedInGenders } = currentUser.preferences;
        const { gender: myGender, age: myAge } = currentUser.basicInfo;

        // Get already-interacted users
        const interactions = await Interaction.find({ fromUserId: currentUserId }).select('toUserId');
        const excludedIds = interactions.map((i: any) => i.toUserId);
        excludedIds.push(currentUserId);

        const users = await User.find({
            _id: { $nin: excludedIds },

            'basicInfo.gender': { $in: interestedInGenders },
            'basicInfo.age': { $gte: ageMin, $lte: ageMax },
            'preferences.interestedInGenders': myGender,
            'preferences.ageMin': { $lte: myAge },
            'preferences.ageMax': { $gte: myAge },
            'basicInfo.basicInfoComplete': true,
            'preferences.preferencesComplete': true,
            'profile.profileComplete': true,
        })
        .select('-password')
        .limit(20);

        res.json({ users });
    } catch (err) {
        console.error('Discover users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/seed-test-users', async (req: Request, res: Response): Promise<void> => {
    try {
        const dummyUsers = [
            {
                email: 'alice@test.edu', password: 'Test1234!',
                basicInfo: { firstName: 'Alice', lastName: 'Smith', age: 21, gender: 'Female', major: 'Biology', classYear: '2026', basicInfoComplete: true },
                preferences: { ageMin: 18, ageMax: 26, interestedInGenders: ['Male'], preferencesComplete: true },
                profile: { bio: 'Love hiking and coffee.', photos: [], promptAnswers: [], interestTagIds: [], profileComplete: true }
            },
            {
                email: 'bob@test.edu', password: 'Test1234!',
                basicInfo: { firstName: 'Bob', lastName: 'Jones', age: 22, gender: 'Male', major: 'CS', classYear: '2025', basicInfoComplete: true },
                preferences: { ageMin: 18, ageMax: 25, interestedInGenders: ['Female'], preferencesComplete: true },
                profile: { bio: 'Big into chess and cooking.', photos: [], promptAnswers: [], interestTagIds: [], profileComplete: true }
            },
            {
                email: 'sara@test.edu', password: 'Test1234!',
                basicInfo: { firstName: 'Sara', lastName: 'Lee', age: 20, gender: 'Female', major: 'Art', classYear: '2027', basicInfoComplete: true },
                preferences: { ageMin: 20, ageMax: 30, interestedInGenders: ['Male', 'Non-binary'], preferencesComplete: true },
                profile: { bio: 'Painter and plant mom.', photos: [], promptAnswers: [], interestTagIds: [], profileComplete: true }
            },
            {
                email: 'dan@test.edu', password: 'Test1234!',
                basicInfo: { firstName: 'Dan', lastName: 'Park', age: 24, gender: 'Male', major: 'Finance', classYear: '2024', basicInfoComplete: true },
                preferences: { ageMin: 21, ageMax: 28, interestedInGenders: ['Male', 'Non-binary'], preferencesComplete: true },
                profile: { bio: 'Runner. Foodie. Bad at texting.', photos: [], promptAnswers: [], interestTagIds: [], profileComplete: true }
            },
            {
                email: 'eli@test.edu', password: 'Test1234!',
                basicInfo: { firstName: 'Eli', lastName: 'Morgan', age: 23, gender: 'Non-binary', major: 'Psychology', classYear: '2025', basicInfoComplete: true },
                preferences: { ageMin: 18, ageMax: 27, interestedInGenders: ['Male', 'Female', 'Non-binary'], preferencesComplete: true },
                profile: { bio: 'Bookworm. Therapy advocate. Dog person.', photos: [], promptAnswers: [], interestTagIds: [], profileComplete: true }
            },
        ];

        const results = [];

        for (const data of dummyUsers) {
            // Skip if already exists
            const existing = await User.findOne({ email: data.email, 'verification.emailVerified': true });
            if (existing) {
                results.push({ email: data.email, status: 'skipped (already exists)' });
                continue;
            }

            // Delete any unverified leftover with same email
            await User.deleteOne({ email: data.email });

            const user = await User.create({
                email: data.email,
                password: data.password,
                basicInfo: data.basicInfo,
                preferences: data.preferences,
                profile: data.profile,
                verification: {
                    emailVerified: true,
                    verifiedAt: new Date(),
                    code: null,
                    codeCreatedAt: null,
                }
            });

            results.push({ email: data.email, status: 'created', id: user._id });
        }

        res.status(201).json({ message: 'Seed complete', results });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/basic-info', authenticate, async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id 

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const { firstName, lastName, age, gender, major, classYear } = req.body

    if (age < 17 || age > 100) {
    res.status(400).json({ message: 'Invalid age' });
    return;
    }

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
                    'basicInfo.basicInfoComplete': true   
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

router.patch('/preferences', authenticate, async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id 

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const { ageMin, ageMax, interestedInGenders } = req.body

    if (!ageMin || !ageMax || !interestedInGenders) {
        res.status(400).json({ message: 'ageMin, ageMax, and interestedInGenders are required' })
        return
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'preferences.ageMin': ageMin,
                    'preferences.ageMax': ageMax,
                    'preferences.interestedInGenders': interestedInGenders,
                    'preferences.preferencesComplete': true   
                }
            },
            { new: true, runValidators: true }
        )

        if (!user || !user.preferences) { res.status(404).json({ message: 'User not found' }); return }

        res.json({
            message: 'Preferences updated',
            user: {
                id: user._id,
                email: user.email,
                preferencesComplete: user.preferences.preferencesComplete
            }
        })
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message })
            return
        }
        console.error('Update preferences error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.patch('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id 

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    }

    const { bio, photos, promptAnswers, datingIntentions } = req.body

    if (!bio || !photos || !promptAnswers || !datingIntentions) {
        res.status(400).json({ message: 'All profile fields are required' })
        return
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'profile.bio': bio,
                    'profile.photos': photos,
                    'profile.promptAnswers': promptAnswers,
                    'profile.profileComplete': true,
                    'profile.datingIntentions': datingIntentions  
                }
            },
            { new: true, runValidators: true }
        )

        if (!user || !user.profile) { res.status(404).json({ message: 'User not found' }); return }

        res.json({
            message: 'Profile updated',
            user: {
                id: user._id,
                email: user.email,
                profileComplete: user.profile.profileComplete
            }
        })
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            res.status(400).json({ message: err.message })
            return
        }
        console.error('Update profile error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /users/:id
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        }
        res.json({ user })
    } catch (err) {
        console.error('Get user by id error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /users/me/photos
router.post(
    '/me/photos',
    authenticate,
    upload.single('photo'),
    async(req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' })
                return
            }

            const user = await User.findById(req.user?.id)
            if (!user) { res.status(404).json({ message: 'User not found' }); return }

            if ((user.profile?.photos.length ?? 0) >= 6) {
                res.status(400).json({ message: 'Maximum 6 photos allowed' })
                return
            }

            const result = await uploadPhoto(
                req.file.buffer,
                `uknighted/users/${req.user?.id}`
            )

            const isPrimary = user.profile?.photos.length === 0

            await User.findByIdAndUpdate(req.user?.id, {
                $push: {
                    'profile.photos': {
                        url: result.url,
                        publicId: result.publicId,
                        isPrimary,
                        order: user.profile?.photos.length
                    }
                }
            })

            res.status(201).json({ url: result.url, publicId: result.publicId, isPrimary })
        } catch (err) {
            console.error('Photo upload error:', err)
            res.status(500).json({ message: 'Server error' })
        }
    }
)

// DELETE /users/me/photos/:photoId
router.delete('/me/photos/:photoId', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id)
        if (!user) { res.status(404).json({ message: 'User not found' }); return }

        const photo = user.profile?.photos.find(
            (p: any) => p._id.toString() === req.params.photoId
        )
        if (!photo) {
            res.status(404).json({ message: 'Photo not found' })
            return
        }

        await deletePhoto(photo.publicId)

        await User.findByIdAndUpdate(req.user?.id, {
            $pull: { 'profile.photos': { _id: photo._id } }
        })

        const remaining = user.profile?.photos.filter(
            (p: any) => p._id.toString() !== req.params.photoId
        ) ?? []
        if (photo.isPrimary && remaining.length > 0) {
            await User.findByIdAndUpdate(
                req.user?.id,
                { $set: { 'profile.photos.0.isPrimary': true } }
            )
        }
        
        res.json({ message: 'Photo deleted' })
    } catch (err) {
        console.error('Photo delete error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

// PATCH /users/me/photos/:photoId/primary
router.patch('/me/photos/:photoId/primary', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id)
        if (!user) { res.status(404).json({ message: 'User not found' }); return }

        const photo = user.profile?.photos.find(
            (p: any) => p._id.toString() === req.params.photoId
        )
        if (!photo) {
            res.status(404).json({ message: 'Photo not found' })
            return
        }

        await User.findByIdAndUpdate(req.user?.id, {
            $set: { 'profile.photos.$[].isPrimary': false }
        })
        await User.findByIdAndUpdate(
            req.user?.id,
            { $set: { 'profile.photos.$[photo].isPrimary': true } },
            { arrayFilters: [{ 'photo._id': photo._id }] }
        )

        res.json({ message: 'Primary photo updated' })
    } catch (err) {
        console.error('Set primary photo error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router;
