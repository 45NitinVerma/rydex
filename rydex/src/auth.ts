import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: {
					type: "email",
					label: "Email",
					placeholder: "johndoe@gmail.com",
				},
				password: {
					type: "password",
					label: "Password",
					placeholder: "*****",
				},
			},
            async authorize(credentials, request){
                const {email, password} = credentials;
                if(!email || !password){
                    throw Error("Please provide email and password")
                }
                
                await connectDB()
                const user = await User.findOne({email})
                if(!user){
                    throw Error("User does not exist")
                }

                const isPasswordValid = await bcrypt.compare(password as string, user.password as string)
                if(!isPasswordValid){
                    throw Error("Invalid password")
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
		}),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
	],
    callbacks: {

        async signIn({user, account}){
            if(account?.provider === "google"){
                await connectDB()
                let dbUser = await User.findOne({email: user.email})
                if(!dbUser){
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        // role: "user" -> default
                    })
                }

                user.id = dbUser?._id
                user.role = dbUser.role
            }
            return true
        },

        async jwt({token, user}){
            if(user){
                token.name = user.name,
                token.id = user.id,
                token.email = user.email,
                token.role = user.role
            }

            return token
        },

        async session ({token, session}){
            if(session.user){
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
            }
            return session
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin'
    },
    session:{
        strategy: "jwt",
        maxAge: 10*24*60*60*1000
    },
    secret: process.env.AUTH_SECRET
});
