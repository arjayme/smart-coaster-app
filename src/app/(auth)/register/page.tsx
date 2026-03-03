"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        general: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const validateForm = () => {
        const newErrors = { email: "", username: "", password: "", confirmPassword: "", general: "" };
        let isValid = true;

        if (!email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
            isValid = false;
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setErrors({ email: "", username: "", password: "", confirmPassword: "", general: "" });

            const { error } = await signUp(email, password, username);

            if (error) {
                setErrors((prev) => ({ ...prev, general: error }));
                setIsLoading(false);
            } else {
                setSuccessMessage("Account created! Check your email to confirm, then log in.");
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            <Link href="/" className="text-sm text-text-light hover:text-accent mb-6 inline-block">
                ← Back to Home
            </Link>

            <h2 className="text-3xl font-bold text-center text-accent mb-8">SIGN UP</h2>

            {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
                    {errors.general}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm text-center">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        EMAIL
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter your email"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

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
                        placeholder="Choose a username"
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
                        placeholder="Create a password"
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        CONFIRM PASSWORD
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent text-secondary py-3 rounded-md font-semibold hover:bg-[#0097a7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Creating account..." : "Sign Up"}
                </button>
            </form>

            <p className="text-center mt-6 text-sm text-text-light">
                Already have an account?{" "}
                <Link href="/login" className="text-accent font-semibold hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
