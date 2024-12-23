import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"; 


import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username: username,
            isVerified: true
        });

        if (existingUserVerifiedByUsername) {
            return Response.json({
                
                success: false,
                message: "User already exists"
            },{status:500})
        }

        const existingUserByEmail = await UserModel.findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists"
                },{status:500})
            } else {
                const hasedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hasedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);


            const newUser = await UserModel.create({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });

            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status:500})
        }

        return Response.json({
            success: false,
            message: "User registered successfully, Please check your email for verification code",
        },{status:201})
            

    } catch (error) {
        console.error('Error registering user', error);
        return Response.json(
            {
                sucess:false,
                message:"Error registering user"
            },
            {
                status:500
            }
        )
    }
}
