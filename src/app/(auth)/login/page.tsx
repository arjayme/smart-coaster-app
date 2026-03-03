"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ username: "", password: "", general: "" });
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = { username: "", password: "", general: "" };
        let isValid = true;

        if (!username.trim()) {
            newErrors.username = "Username is required";
            isValid = false;
        }

        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setErrors({ username: "", password: "", general: "" });

            const { error } = await signIn(username, password);

            if (error) {
                setErrors((prev) => ({ ...prev, general: error }));
                setIsLoading(false);
            } else {
                router.push("/tracker");
            }
        }
    };

    return (
        <div>
            <Link href="/" className="text-sm text-text-light hover:text-accent mb-6 inline-block">
                ← Back to Home
            </Link>

            <h2 className="text-3xl font-bold text-center text-accent mb-8">LOGIN</h2>

            {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                        USERNAME
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${errors.username ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter your username"
                        disabled={isLoading}
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        PASSWORD
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${errors.password ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter your password"
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent text-secondary py-3 rounded-md font-semibold hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-center mt-6 text-sm text-text-light">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-accent font-semibold hover:underline">
                    Sign up?
                </Link>
            </p>
        </div>
    );
}
