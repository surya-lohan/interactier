"use client"

import { signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();
    const handleSignUP = async () => {
        const { data, error } = await signUp.email({
            name,
            email,
            password
        })

        if (error) {
            console.error("Sign Up Failed:", error.message);
            alert(error.message);
            return;
        }

        console.log("User created!", data);
        router.push('/dashboard')
    }

    return (
        <>
            <div className="bg-[#0B1326] p-2 w-screen h-screen flex items-center gap -2 justify-center">
                <div className="bg-[#171F33] w-2/6 h-fit p-4 rounded-md">
                    <div className="flex flex-col mt-4 items-center justify-center gap-2.5">
                        <h1 className="text-[#C0C1FF] font-bold text-3xl">InterACTier</h1>
                        <h2 className="text-white font-semibold text-2xl">Create your account</h2>
                        <h3 className="text-sm">Joint to start collaborating</h3>
                    </div>
                    <div className="p-2 mt-4 flex flex-col justify-center gap-2">
                        <div className="p-2">
                            <h3 className="text-[11px] mx-0.5 font-semibold">FULL NAME</h3>
                            <input onChange={(e) => setName(e.currentTarget.value)} className="rounded-sm py-2 px-3 w-full border-gray-400 border" type="text" placeholder="Jhon doe" />
                        </div>
                        <div className="p-2">
                            <h3 className="text-[11px] mx-0.5">EMAIL ADDRESS</h3>
                            <input onChange={(e) => setEmail(e.currentTarget.value)} className="rounded-sm py-2 px-3 w-full border-gray-400 border" type="email" placeholder="example@gmail.com" />
                        </div>
                        <div className="p-2">
                            <h3 className="text-[11px] mx-0.5">PASSWORD</h3>
                            <input onChange={(e) => setPassword(e.currentTarget.value)} className="rounded-sm py-2 font-white px-3 w-full border-gray-400 border" type="password" placeholder="********" />
                        </div>
                        <button onClick={handleSignUP} className="bg-[#8083FF] m-3 rounded-md p-4 text-[#100398] font-bold hover:cursor-pointer hover:bg-[#3232ed] hover:text-white transition-all ease-in delay-75">Create Account</button>
                        <h4 className="text-center text-sm">Already have an account? <a className="underline" href="/auth/signin">Sign in</a></h4>
                    </div>
                </div>
            </div>
        </>
    )
}