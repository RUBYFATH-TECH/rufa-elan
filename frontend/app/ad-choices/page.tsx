import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Choices - RUFA ELAN",
  description: "Learn about advertising choices and preferences on RUFA ELAN.",
};

export default function AdChoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ad Choices</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Our Advertising</h2>
            <p className="text-gray-600 leading-7 mb-4">
              RUFA ELAN uses advertising to help support our platform and bring you relevant 
              product recommendations. We believe in transparent advertising practices and giving 
              you control over your advertising experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Types of Advertising</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Product Recommendations</h3>
                <p className="text-gray-600 text-sm">
                  We show you products that might interest you based on your browsing history, 
                  purchases, and preferences. These help you discover new items you might love.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Promotional Campaigns</h3>
                <p className="text-gray-600 text-sm">
                  We feature special offers, sales, and new arrivals from our partner brands 
                  and sellers to keep you informed about the best deals.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Email Marketing</h3>
                <p className="text-gray-600 text-sm">
                  We send personalized email newsletters with fashion tips, exclusive offers, 
                  and product updates based on your interests and purchase history.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Advertising Choices</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-4">You Have Control</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">Email Preferences</h4>
                  <p className="text-gray-600 text-sm">
                    You can unsubscribe from marketing emails at any time by clicking the 
                    unsubscribe link in any email or managing your preferences in your account settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Product Recommendations</h4>
                  <p className="text-gray-600 text-sm">
                    You can opt out of personalized product recommendations by adjusting your 
                    privacy settings in your account dashboard.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Third-Party Ads</h4>
                  <p className="text-gray-600 text-sm">
                    We may display ads from third-party partners. You can control these through 
                    your device settings or by visiting the Digital Advertising Alliance opt-out page.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How We Target Ads</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-7">
                We use the following information to show you relevant advertisements:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Products you&apos;ve viewed or purchased</li>
                <li>• Items in your wishlist or cart</li>
                <li>• Your stated preferences and interests</li>
                <li>• General demographic information (age range, location)</li>
                <li>• Device and browser information</li>
                <li>• Time and frequency of your visits</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                We never sell your personal information to advertisers. All targeting is done 
                within our platform to enhance your shopping experience.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Managing Your Preferences</h2>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-4">Account Settings</h3>
              <p className="text-gray-600 mb-4">
                You can manage your advertising preferences by:
              </p>
              <ol className="space-y-2 text-gray-600">
                <li>1. Logging into your RUFA ELAN account</li>
                <li>2. Going to Account Settings → Privacy</li>
                <li>3. Adjusting your advertising preferences</li>
                <li>4. Saving your changes</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Third-Party Advertising</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-7">
                We may work with third-party advertising partners to show you relevant ads 
                on other websites and platforms. These partners may use cookies and similar 
                technologies to provide targeted advertising.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-gray-800 mb-2">Opt-Out Options</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Visit the Digital Advertising Alliance opt-out page</li>
                  <li>• Use your browser&apos;s "Do Not Track" feature</li>
                  <li>• Adjust your device&apos;s advertising settings</li>
                  <li>• Contact us to request opt-out assistance</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Protection</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-7">
                We are committed to protecting your privacy while providing relevant advertising:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• All advertising data is encrypted and securely stored</li>
                <li>• We never share personally identifiable information with advertisers</li>
                <li>• You can request deletion of your advertising data at any time</li>
                <li>• Our advertising practices comply with applicable privacy laws</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600 mb-4">
                If you have questions about our advertising practices or need help with your preferences:
              </p>
              <div className="space-y-2">
                <p className="text-gray-800">
                  <span className="font-medium">Privacy Team:</span> privacy@rufaelan.com
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Customer Support:</span> support@rufaelan.com
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Phone:</span> +90 505 378 3510
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              This Ad Choices page was last updated in March 2024. We may update our 
              advertising practices from time to time and will notify you of any significant changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}