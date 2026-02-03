export function StatsSection() {
  return (
    <section className="bg-gray-50 py-16 mt-20 border-y border-gray-100">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-gray-200">
                <div className="p-4">
                    <div className="text-4xl font-extrabold text-primary mb-2">500+</div>
                    <div className="text-gray-500 font-medium">Unique Stays</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-extrabold text-primary mb-2">50K+</div>
                    <div className="text-gray-500 font-medium">Happy Guests</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-extrabold text-primary mb-2">100+</div>
                    <div className="text-gray-500 font-medium">Destinations</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-extrabold text-primary mb-2">4.9</div>
                    <div className="text-gray-500 font-medium">Average Rating</div>
                </div>
            </div>
        </div>
    </section>
  );
}
