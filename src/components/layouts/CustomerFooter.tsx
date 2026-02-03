import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export function CustomerFooter() {
  return (
    <footer className="bg-gray-50 border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
                <h3 className="font-bold text-xl">Escape Plan.</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Experience the perfect blend of luxury and nature. 
                    We connect you with the most beautiful glamping destinations 
                    for your ultimate escape.
                </p>
                <div className="flex gap-4">
                    <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all"><FaInstagram /></a>
                    <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all"><FaFacebookF /></a>
                    <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all"><FaTwitter /></a>
                    <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all"><FaTiktok /></a>
                </div>
            </div>

            <div>
                <h4 className="font-bold mb-6">Discover</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li><a href="/search" className="hover:text-black hover:underline">All Stays</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Glamping</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Cabins</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Treehouses</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Beach Houses</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Mountain Retreats</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold mb-6">Destinations</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-black hover:underline">Bogor</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Puncak</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Bandung</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Yogyakarta</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Bali</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Lombok</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold mb-6">Support</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-black hover:underline">Help Center</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Safety Information</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Cancellation Options</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">COVID-19 Response</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Contact Us</a></li>
                    <li><a href="#" className="hover:text-black hover:underline">Partnerships</a></li>
                </ul>
            </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Escape Plan. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-black">Privacy Policy</a>
                <a href="#" className="hover:text-black">Terms of Service</a>
                <a href="#" className="hover:text-black">Cookie Policy</a>
                <a href="#" className="hover:text-black">Sitemap</a>
            </div>
            <div className="flex gap-4 text-2xl text-gray-400">
                <FaCcVisa title="Visa" className="hover:text-gray-600" />
                <FaCcMastercard title="Mastercard" className="hover:text-gray-600" />
                <FaCcAmex title="American Express" className="hover:text-gray-600" />
                <FaCcPaypal title="PayPal" className="hover:text-gray-600" />
            </div>
        </div>
      </div>
    </footer>
  );
}
