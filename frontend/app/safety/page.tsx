import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Center - RUFA ELAN",
  description: "Learn about RUFA ELAN's safety measures and how we protect our customers.",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Safety Center</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Safety is Our Priority</h2>
            <p className="text-gray-600 leading-7">
              At RUFA ELAN, we&apos;re committed to providing a safe and secure shopping experience. 
              We&apos;ve implemented comprehensive safety measures to protect your personal information, 
              financial data, and overall shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Safety Measures</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">🔐 Secure Payments</h3>
                <p className="text-gray-600 text-sm">
                  All payment transactions are encrypted using industry-standard SSL technology. 
                  We never store your complete payment information.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">🛡️ Data Protection</h3>
                <p className="text-gray-600 text-sm">
                  Your personal information is protected with advanced encryption and stored 
                  securely according to international data protection standards.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">✅ Verified Sellers</h3>
                <p className="text-gray-600 text-sm">
                  All sellers on our platform undergo verification processes to ensure 
                  authenticity and reliability.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">📦 Product Authenticity</h3>
                <p className="text-gray-600 text-sm">
                  We work closely with suppliers to ensure all products are authentic 
                  and meet our quality standards.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Safe Shopping Tips</h2>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-4">Protect Your Account</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use a strong, unique password for your RUFA ELAN account</li>
                <li>• Never share your login credentials with anyone</li>
                <li>• Log out from shared or public devices</li>
                <li>• Enable two-factor authentication when available</li>
                <li>• Regularly review your account activity</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recognize and Avoid Scams</h2>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-800 mb-3">⚠️ Warning Signs</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Requests for payment outside our secure platform</li>
                <li>• Deals that seem too good to be true</li>
                <li>• Urgent requests for personal information via email or phone</li>
                <li>• Sellers asking for direct bank transfers or cash payments</li>
                <li>• Suspicious emails claiming to be from RUFA ELAN</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy Protection</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-7">
                We respect your privacy and are committed to protecting your personal information. 
                Our privacy practices include:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Collecting only necessary information for your orders</li>
                <li>• Never selling your personal data to third parties</li>
                <li>• Providing clear opt-out options for marketing communications</li>
                <li>• Regular security audits and updates</li>
                <li>• Transparent privacy policy explaining our data practices</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h2>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 mb-4">
                If you have safety concerns or need to report a security issue:
              </p>
              <div className="space-y-2">
                <p className="text-gray-800">
                  <span className="font-medium">Security Team:</span> security@rufaelan.com
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Customer Support:</span> support@rufaelan.com
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Emergency Contact:</span> +90 505 378 3510
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Stay Informed</h2>
            <p className="text-gray-600 leading-7">
              We regularly update our safety measures and will notify you of any important 
              security updates. Follow our social media channels and check your email for 
              the latest safety information and tips.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}