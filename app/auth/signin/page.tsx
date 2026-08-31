"use client"
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Signin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {

        const { data, error } = await signIn.email({
            email,
            password
        })

        if (error) {
            console.error("Login Failed:", error.message);
            alert(error.message || "Invalid Credentials");
            return;
        }

        console.log("Logged in successfully!", data);
        router.push('/dashboard')
    }

    return (
        <div className="bg-[#0B1326] p-2 w-screen h-screen flex items-center gap -2 justify-center">
            <div className="bg-[#171F33] w-2/6 h-fit p-4 rounded-md">
                <div className="flex flex-col mt-4 items-center justify-center gap-2.5">
                    <h1 className="text-[#C0C1FF] font-bold text-3xl">InterACTier</h1>
                    <h2 className="text-white font-semibold text-2xl">Sign in to InterACTier</h2>
                    <h3 className="text-sm">Continue to your technical workspace</h3>
                </div>
                <div className="p-2 mt-4 flex flex-col justify-center gap-2">
                    <div className="p-2">
                        <h3 className="text-[11px] mx-0.5">EMAIL ADDRESS</h3>
                        <input onChange={(e) => setEmail(e.currentTarget.value)} className="rounded-sm py-2 px-3 w-full border-gray-400 border" type="email" placeholder="example@gmail.com" />
                    </div>
                    <div className="p-2">
                        <h3 className="text-[11px] mx-0.5">PASSWORD</h3>
                        <input onChange={(e) => setPassword(e.currentTarget.value)} className="rounded-sm py-2 font-white px-3 w-full border-gray-400 border" type="password" placeholder="********" />
                    </div>
                    <button onClick={handleSubmit} className="bg-[#8083FF] m-5 rounded-md p-4 text-[#100398] font-bold hover:cursor-pointer hover:bg-[#3232ed] hover:text-white transition-all ease-in delay-75">Sign In</button>
                    <h4 className="text-center text-sm">Don't have an account? <a className="underline" href="/auth/signup">Sign Up</a></h4>
                </div>
            </div>
        </div>
    );
};