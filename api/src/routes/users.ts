import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";
import { User } from "../models/User";

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

        const interactions = await Interaction.find({ fromUserId: currentUserId }).select('toUserId');
        const excludedIds = interactions.map((i: any) => i.toUserId);
        excludedIds.push(currentUserId);

        const users = await User.find({
            _id: { $nin: excludedIds }
        })
        .select('-password')
        .limit(20);

        res.json({ users });
    } catch (err) {
        console.error('Discover users error:', err);
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

    const { ageMin, ageMax, interestedInGenders, preferredInterestTagIds, dealbreakerTagIds } = req.body

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
                    'preferences.preferredInterestTagIds': preferredInterestTagIds,
                    'preferences.dealbreakerTagIds': dealbreakerTagIds,
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

    const { bio, photos, promptAnswers, interestTagIds } = req.body

    if (!bio || !photos || !promptAnswers || !interestTagIds) {
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
                    'profile.interestTagIds': interestTagIds,
                    'profile.profileComplete': true   
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

export default router;
