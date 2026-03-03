import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-50 mt-auto py-12 px-4 border-t border-gray-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                {/* Features */}
                <div>
                    <h4 className="text-accent font-bold mb-4">Features</h4>
                    <ul className="space-y-2 text-text-light">
                        <li><Link href="#" className="hover:underline">Smart Sensing</Link></li>
                        <li><Link href="#" className="hover:underline">App Integration</Link></li>
                        <li><Link href="#" className="hover:underline">Glow Reminders</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-accent font-bold mb-4">Resources</h4>
                    <ul className="space-y-2 text-text-light">
                        <li><Link href="#" className="hover:underline">Blog</Link></li>
                        <li><Link href="#" className="hover:underline">Help Center</Link></li>
                        <li><Link href="#" className="hover:underline">Contact Support</Link></li>
                    </ul>
                </div>

                {/* Get in Touch */}
                <div>
                    <h4 className="text-accent font-bold mb-4">Get in Touch</h4>
                    <ul className="space-y-2 text-text-light">
                        <li><Link href="#" className="hover:underline">Contact Us</Link></li>
                        <li><Link href="#" className="hover:underline">About Us</Link></li>
                        <li><Link href="#" className="hover:underline">Careers</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-text-light text-sm">
                &copy; {new Date().getFullYear()} Smart Coaster. All rights reserved.
            </div>
        </footer>
    );
}
