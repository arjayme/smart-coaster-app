"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (username: string, password: string) => Promise<{ error: string | null }>;
    signIn: (username: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert username to a fake email for Supabase (it requires email internally)
function usernameToEmail(username: string): string {
    return `${username.toLowerCase().trim()}@smartcoaster.app`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (username: string, password: string) => {
        const email = usernameToEmail(username);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        });
        if (error) {
            if (error.message.includes("already registered")) {
                return { error: "Username is already taken" };
            }
            return { error: error.message };
        }
        return { error: null };
    };

    const signIn = async (username: string, password: string) => {
        const email = usernameToEmail(username);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                return { error: "Invalid username or password" };
            }
            return { error: error.message };
        }
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
