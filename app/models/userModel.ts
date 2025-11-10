import mongoose, { Schema } from 'mongoose';
import { UserInterface } from '../interface/user.interface';
import Joi from 'joi'

export const signupSchemaValidation = Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().trim(),
    password: Joi.string().min(6).required().trim(),
    profilePicture: Joi.string().optional(),

});


export const LoginSchemaValidate = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().trim(),
});


const userSchema = new Schema<UserInterface>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, },
        password: { type: String, required: true },
        profilePicture: { type: String },
        isVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        role: { type: String, default: 'user' }

    },
    { timestamps: true }
);


export const UserModel = mongoose.model<UserInterface>('user', userSchema);