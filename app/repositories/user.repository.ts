import { UserModel } from '../models/userModel';
import { UserInterface } from '../interface/user.interface';
import fs from 'fs'

class UserRepositories {
    //create a post
    async save(data: UserInterface) {
        try {
            const newDataCreate = await UserModel.create(data)
            return newDataCreate;

        } catch (error) {
            console.log(error)
        }
    }


    async findUserByEmail(email: string) {
        try {
            const findEmailId = await UserModel.findOne({ email });
            return findEmailId;

        } catch (error) {
            console.log(error)
        }
    };

  //all data
    async find() {
        try {
            const getAllUsers = await UserModel.find()
            return getAllUsers
        } catch (error) {
            console.log(error)
        }
    }

    async findUserById(id: string) {
        try {
            const getuser = await UserModel.findById({ _id: id })
            if (!getuser) {
                return 'user not available'
            }
            return getuser
        } catch (error) {
            console.log(error);
        }
    }

    async update_user(id: string, data: Partial<UserInterface>, newProfilePicture?: string) {
        try {
            const user = await UserModel.findById(id);
            if (!user) return null;

            if (data.name) user.name = data.name;


            // Update profile picture
            if (newProfilePicture) {
                const oldPic = user.profilePicture;
                // Delete old image 
                if (oldPic && fs.existsSync(oldPic)) {
                    fs.unlinkSync(oldPic);
                }
                user.profilePicture = newProfilePicture;
            }

            const updatedUser = await user.save();
            return updatedUser;

        } catch (error) {
            console.log(error);
            throw error;
        }
    };


}
const userRepositories = new UserRepositories()
export { userRepositories }