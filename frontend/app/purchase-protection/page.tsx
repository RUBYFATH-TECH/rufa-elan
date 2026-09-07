import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Protection - RUFA ELAN",
  description: "Learn about RUFA ELAN's purchase protection policy and how we protect your orders.",
};

export default function PurchaseProtectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">RUFA ELAN Purchase Protection</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shop with Confidence</h2>
            <p className="text-gray-600 leading-7 mb-4">
              Every purchase on RUFA ELAN is protected by our comprehensive Purchase Protection 
              program. We&apos;re committed to ensuring you have a positive shopping experience 
              and receive exactly what you ordered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What&apos;s Covered</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">📦 Item Not Received</h3>
                <p className="text-gray-600 text-sm">
                  If your order doesn&apos;t arrive within the expected delivery timeframe, 
                  we&apos;ll provide a full refund or send a replacement at no extra cost.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">🔍 Item Not as Described</h3>
                <p className="text-gray-600 text-sm">
                  If the item you receive is significantly different from the description 
                  or photos, you&apos;re eligible for a full refund or exchange.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">💔 Damaged Items</h3>
                <p className="text-gray-600 text-sm">
                  Items damaged during shipping are fully covered. We&apos;ll send a 
                  replacement or provide a full refund immediately.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">❌ Defective Products</h3>
                <p className="text-gray-600 text-sm">
                  Products with manufacturing defects or quality issues are covered 
                  under our protection program for hassle-free returns.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coverage Period</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Standard Items</h3>
                  <p className="text-gray-600">Protected for 30 days from delivery date</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Electronics & Accessories</h3>
                  <p className="text-gray-600">Protected for 60 days from delivery date</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Custom Orders</h3>
                  <p className="text-gray-600">Protected for 14 days from delivery date</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to File a Claim</h2>
            <div className="bg-white p-6 rounded-lg border">
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">1.</span>
                  <div>
                    <h4 className="font-medium">Contact Us First</h4>
                    <p className="text-gray-600 text-sm">Reach out to our customer service team within the coverage period</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">2.</span>
                  <div>
                    <h4 className="font-medium">Provide Evidence</h4>
                    <p className="text-gray-600 text-sm">Submit photos, videos, or other evidence of the issue</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">3.</span>
                  <div>
                    <h4 className="font-medium">Investigation</h4>
                    <p className="text-gray-600 text-sm">We&apos;ll review your claim and may contact the seller for additional information</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">4.</span>
                  <div>
                    <h4 className="font-medium">Resolution</h4>
                    <p className="text-gray-600 text-sm">If approved, you&apos;ll receive a refund or replacement within 5-7 business days</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What&apos;s Not Covered</h2>
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <ul className="space-y-2 text-gray-700">
                <li>• Items damaged due to misuse or normal wear and tear</li>
                <li>• Claims filed after the coverage period expires</li>
                <li>• Items returned without proper packaging or in unsellable condition</li>
                <li>• Size or color preferences (unless significantly different from description)</li>
                <li>• Items damaged during return shipping (unless pre-approved)</li>
                <li>• Custom or personalized items (unless defective)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Resolution</h2>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-800 mb-3">Fast Track Process</h3>
              <p className="text-gray-700 mb-3">
                For qualifying issues, we offer instant resolution:
              </p>
              <ul className="space-y-1 text-gray-700">
                <li>• Automatic refunds for items not delivered within 30 days</li>
                <li>• Instant credit for items with clear quality issues</li>
                <li>• Express replacement shipping for damaged items</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Our Protection Team</h2>
            <div className="bg-white p-6 rounded-lg border">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-800 font-medium">Purchase Protection Team</p>
                  <p className="text-gray-600">Email: protection@rufaelan.com</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Phone Support</p>
                  <p className="text-gray-600">+90 505 378 3510</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Live Chat</p>
                  <p className="text-gray-600">Available 24/7 on our website</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Response Time</p>
                  <p className="text-gray-600">Within 24 hours for protection claims</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              Our Purchase Protection program is designed to give you peace of mind when 
              shopping on RUFA ELAN. We stand behind every transaction and are here to 
              help resolve any issues quickly and fairly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}