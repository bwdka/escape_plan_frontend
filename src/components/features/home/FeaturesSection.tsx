import { FaShieldAlt, FaHandHoldingHeart, FaHeadset } from 'react-icons/fa';

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Escape Plan?</h2>
            <p className="text-gray-600 text-lg">We make finding your perfect nature getaway simple, safe, and memorable.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaShieldAlt className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Properties</h3>
                <p className="text-gray-500 leading-relaxed">Every property is personally verified by our team to ensure quality and safety standards.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaHandHoldingHeart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Best Price Guarantee</h3>
                <p className="text-gray-500 leading-relaxed">Find a lower price? We'll match it and give you an extra 10% off your booking.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaHeadset className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
                <p className="text-gray-500 leading-relaxed">Our dedicated support team is always here to help you before, during, and after your stay.</p>
            </div>
        </div>
    </section>
  );
}
