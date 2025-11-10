export interface UserInterface {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    isVerified: boolean;
    verificationToken?: string;
    role:string;
    createdAt?: Date;
    updatedAt?: Date;
}