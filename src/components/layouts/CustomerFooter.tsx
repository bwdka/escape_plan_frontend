import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export function CustomerFooter() {
  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
            <div className="space-y-6">
                <h3 className="font-black text-2xl tracking-tighter">Escape <span className="text-accent">Plan.</span></h3>
                <p className="text-primary-foreground/60 text-sm leading-relaxed font-medium">
                    Experience the perfect blend of luxury and nature. 
                    We connect you with the most beautiful glamping destinations 
                    for your ultimate escape.
                </p>
                <div className="flex gap-4">
                    {[FaInstagram, FaFacebookF, FaTwitter, FaTiktok].map((Icon, i) => (
                        <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent hover:bg-white/10 transition-all duration-300">
                            <Icon size={16} />
                        </a>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">Discover</h4>
                <ul className="space-y-3 text-sm text-primary-foreground/50 font-bold">
                    <li><a href="/search" className="hover:text-primary-foreground transition-colors">All Stays</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Luxury Tents</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Wooden Cabins</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Treehouse Stays</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Mountain Domes</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">Destinations</h4>
                <ul className="space-y-3 text-sm text-primary-foreground/50 font-bold">
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Lembang, Bandung</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Puncak, Bogor</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Kintamani, Bali</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Ciwidey, Bandung</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Sentul, Bogor</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">Join Us</h4>
                <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                    <p className="text-xs font-bold leading-relaxed">Have a unique property? Start hosting today.</p>
                    <a href="/partner/register" className="block w-full bg-accent text-accent-foreground text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                        Become a Host
                    </a>
                </div>
            </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/30">
                &copy; {new Date().getFullYear()} Escape Plan Global. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-primary-foreground/30">
                <a href="#" className="hover:text-accent transition-colors">Privacy</a>
                <a href="#" className="hover:text-accent transition-colors">Terms</a>
                <a href="#" className="hover:text-accent transition-colors">Cookies</a>
            </div>
            <div className="flex gap-6 text-xl text-primary-foreground/20">
                <FaCcVisa />
                <FaCcMastercard />
                <FaCcAmex />
                <FaCcPaypal />
            </div>
        </div>
      </div>
    </footer>
  );
}
