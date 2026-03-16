'use client';

import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from 'react-icons/fa';
import { useI18n } from '@/i18n/I18nProvider';

export function CustomerFooter() {
  const { t } = useI18n();
  return (
    <footer className="bg-primary text-primary-foreground pt-14 md:pt-16 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.15),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-10">
            <div className="space-y-6">
                <h3 className="font-black text-2xl tracking-tighter">Escape <span className="text-accent">Plan.</span></h3>
                <p className="text-primary-foreground/60 text-sm leading-relaxed font-medium">
                    {t({
                      id: 'Rasakan perpaduan sempurna antara kemewahan dan alam. Kami menghubungkan Anda dengan destinasi glamping paling indah untuk pelarian terbaik.',
                      en: 'Experience the perfect blend of luxury and nature. We connect you with the most beautiful glamping destinations for your ultimate escape.'
                    })}
                </p>
                <div className="flex flex-wrap gap-3">
                    {[FaInstagram, FaFacebookF, FaTwitter, FaTiktok].map((Icon, i) => (
                        <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent hover:bg-white/10 transition-all duration-300">
                            <Icon size={16} />
                        </a>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">{t({ id: 'Jelajahi', en: 'Discover' })}</h4>
                <ul className="space-y-3 text-sm text-primary-foreground/50 font-bold">
                    <li><a href="/search" className="hover:text-primary-foreground transition-colors">{t({ id: 'Semua Penginapan', en: 'All Stays' })}</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">{t({ id: 'Tenda Mewah', en: 'Luxury Tents' })}</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">{t({ id: 'Kabins Kayu', en: 'Wooden Cabins' })}</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">{t({ id: 'Rumah Pohon', en: 'Treehouse Stays' })}</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">{t({ id: 'Kubah Pegunungan', en: 'Mountain Domes' })}</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">{t({ id: 'Destinasi', en: 'Destinations' })}</h4>
                <ul className="space-y-3 text-sm text-primary-foreground/50 font-bold">
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Lembang, Bandung</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Puncak, Bogor</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Kintamani, Bali</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Ciwidey, Bandung</a></li>
                    <li><a href="#" className="hover:text-primary-foreground transition-colors">Sentul, Bogor</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-accent">{t({ id: 'Bergabung', en: 'Join Us' })}</h4>
                <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                    <p className="text-xs font-bold leading-relaxed">{t({ id: 'Punya properti unik? Mulai jadi host hari ini.', en: 'Have a unique property? Start hosting today.' })}</p>
                    <a href="/partner/register" className="block w-full bg-accent text-accent-foreground text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
                        {t({ id: 'Jadi Host', en: 'Become a Host' })}
                    </a>
                </div>
            </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/30 text-center lg:text-left">
                &copy; {new Date().getFullYear()} Escape Plan Global. {t({ id: 'Seluruh hak cipta dilindungi.', en: 'All rights reserved.' })}
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-primary-foreground/30">
                <a href="#" className="hover:text-accent transition-colors">{t({ id: 'Privasi', en: 'Privacy' })}</a>
                <a href="#" className="hover:text-accent transition-colors">{t({ id: 'Ketentuan', en: 'Terms' })}</a>
                <a href="#" className="hover:text-accent transition-colors">{t({ id: 'Cookies', en: 'Cookies' })}</a>
            </div>
            <div className="flex flex-wrap gap-4 text-lg text-primary-foreground/20">
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
