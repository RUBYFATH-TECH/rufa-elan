import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Suspicious Activity - RUFA ELAN",
  description: "Report suspicious activity or security concerns to RUFA ELAN.",
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Report Suspicious Activity</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Help Us Keep RUFA ELAN Safe</h2>
            <p className="text-gray-600 leading-7 mb-4">
              We take the security and safety of our platform seriously. If you&apos;ve encountered 
              any suspicious activity, fraudulent behavior, or security concerns while using 
              RUFA ELAN, please report it to us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What to Report</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Fraudulent Activity</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Fake products or counterfeit items</li>
                  <li>• Unauthorized charges</li>
                  <li>• Phishing attempts</li>
                  <li>• Fake seller accounts</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Security Issues</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Account compromises</li>
                  <li>• Suspicious login attempts</li>
                  <li>• Website vulnerabilities</li>
                  <li>• Data breaches</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Inappropriate Content</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Offensive product descriptions</li>
                  <li>• Inappropriate reviews</li>
                  <li>• Spam content</li>
                  <li>• Copyright violations</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-3">Other Concerns</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Seller misconduct</li>
                  <li>• Policy violations</li>
                  <li>• Technical issues</li>
                  <li>• Any other suspicious behavior</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Report</h2>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Our Security Team</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-800 font-medium">Email (Recommended)</p>
                  <p className="text-gray-600">security@rufaelan.com</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Emergency Phone</p>
                  <p className="text-gray-600">+90 505 378 3510</p>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Response Time</p>
                  <p className="text-gray-600">We respond to security reports within 24 hours</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Information to Include</h2>
            <p className="text-gray-600 mb-4">
              To help us investigate effectively, please include:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Detailed description of the issue</li>
              <li>• Screenshots or evidence (if available)</li>
              <li>• Date and time of occurrence</li>
              <li>• Your account information (if relevant)</li>
              <li>• Any communication or messages received</li>
              <li>• Steps you&apos;ve already taken to address the issue</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">What Happens Next?</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">1.</span>
                  We&apos;ll acknowledge receipt of your report within 24 hours
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">2.</span>
                  Our security team will investigate the issue thoroughly
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">3.</span>
                  We&apos;ll take appropriate action to address the concern
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">4.</span>
                  We&apos;ll follow up with you on the resolution (when appropriate)
                </li>
              </ol>
            </div>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              All reports are treated confidentially. We appreciate your help in keeping 
              RUFA ELAN a safe and trustworthy platform for all users.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}