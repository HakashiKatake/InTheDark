import { NextAuthOptions } from "next-auth";
import credentials, { CredentialsProvider } from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [{ email: credentials.identifier }, { username: credentials.identifier }],

                    });
                    if (!user) {
                        throw new Error("User not found");
                    }
                    if (!user.isVerified) {
                        throw new Error("User is not verified");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Invalid password");
                    }
                    
                } catch (err: any) {
                    console.error("Authorization error:", err);
                    throw new Error("Authorization failed. Please try again.");
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token._id = user._id;
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessages;
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
                session.user.username = token.username
            }
            return session
        },
    },

    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
}

