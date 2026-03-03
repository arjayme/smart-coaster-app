export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8 bg-primary">
            <div className="w-full max-w-md space-y-8 bg-secondary p-10 rounded-xl shadow-md">
                {children}
            </div>
        </div>
    );
}
