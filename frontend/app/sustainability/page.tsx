import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustainability Program - RUFA ELAN",
  description: "Learn about RUFA ELAN's commitment to sustainable fashion and environmental responsibility.",
};

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">RUFA ELAN&apos;s Sustainability Program</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Commitment to Sustainability</h2>
            <p className="text-gray-600 leading-7">
              At RUFA ELAN, we believe that fashion should not come at the expense of our planet. 
              We&apos;re committed to building a more sustainable future through responsible sourcing, 
              eco-friendly packaging, and supporting local communities across Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Initiatives</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Eco-Friendly Packaging</h3>
                <p className="text-gray-600 text-sm">
                  We use recyclable and biodegradable packaging materials to reduce our environmental impact.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Local Sourcing</h3>
                <p className="text-gray-600 text-sm">
                  Supporting local artisans and manufacturers to reduce transportation emissions and boost local economy.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Quality Over Quantity</h3>
                <p className="text-gray-600 text-sm">
                  We focus on durable, high-quality pieces that last longer, reducing the need for frequent replacements.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Community Impact</h3>
                <p className="text-gray-600 text-sm">
                  Supporting women entrepreneurs and fashion designers across Ghana through our platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Goals</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Achieve 100% recyclable packaging by 2025</li>
              <li>• Source 50% of products from local Ghanaian designers by 2026</li>
              <li>• Implement a clothing recycling program</li>
              <li>• Reduce carbon footprint by 30% through optimized logistics</li>
              <li>• Support 1000+ women entrepreneurs in the fashion industry</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Get Involved</h2>
            <p className="text-gray-600">
              Want to learn more about our sustainability efforts or have suggestions? 
              Contact us at{" "}
              <a href="mailto:sustainability@rufaelan.com" className="text-blue-600 hover:text-blue-800">
                sustainability@rufaelan.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}