'use client';

import { FaShieldAlt, FaHandHoldingHeart, FaHeadset } from 'react-icons/fa';
import { useI18n } from '@/i18n/I18nProvider';

export function FeaturesSection() {
  const { t } = useI18n();
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
            <h2 className="font-display text-3xl md:text-4xl font-black mb-6 tracking-[-0.02em] text-primary">
              {t({ id: 'Kenapa Memilih', en: 'Why Choose' })}{' '}
              <span className="text-accent underline decoration-primary/10 underline-offset-8">Escape Plan?</span>
            </h2>
            <p className="text-primary/60 text-lg font-medium leading-relaxed">
              {t({
                id: 'Kami memudahkan Anda menemukan pelarian alam yang aman dan berkesan.',
                en: 'We make finding your perfect nature getaway simple, safe, and memorable.'
              })}
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {[
                { 
                  icon: FaShieldAlt, 
                  title: { id: 'Penginapan Terverifikasi', en: 'Verified Stays' }, 
                  desc: { id: 'Setiap properti diverifikasi langsung oleh tim kami untuk memastikan kualitas dan keamanan.', en: 'Every property is personally verified by our team to ensure quality and safety standards.' }
                },
                { 
                  icon: FaHandHoldingHeart, 
                  title: { id: 'Harga Terbaik', en: 'Price Match' }, 
                  desc: { id: 'Dapatkan harga lebih rendah? Kami samakan dan beri diskon ekstra 10%.', en: "Find a lower price? We'll match it and give you an extra 10% off your booking." }
                },
                { 
                  icon: FaHeadset, 
                  title: { id: 'Concierge 24/7', en: 'Concierge 24/7' }, 
                  desc: { id: 'Tim support kami siap membantu sebelum, selama, dan setelah menginap.', en: 'Our dedicated support team is always here to help you before, during, and after your stay.' }
                }
            ].map((feature, i) => (
                <div key={i} className="group relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] rotate-2 group-hover:rotate-0 transition-transform duration-500" />
                    <div className="relative bg-white p-6 md:p-8 lg:p-10 rounded-[2.5rem] border border-black/5 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 text-center h-full overflow-hidden">
                        <div className="absolute -top-10 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
                        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                            <feature.icon className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 text-primary">{t(feature.title)}</h3>
                        <p className="text-primary/50 font-medium leading-relaxed">{t(feature.desc)}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
  );
}
