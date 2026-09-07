import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers - RUFA ELAN",
  description: "Join our team and help us build the future of fashion retail in Ghana.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Careers at RUFA ELAN</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Join Our Growing Team</h2>
            <p className="text-gray-600 leading-7">
              At RUFA ELAN, we&apos;re passionate about bringing quality fashion to women across Ghana. 
              We&apos;re always looking for talented individuals who share our vision of making fashion 
              accessible and affordable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Work With Us?</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Competitive salary and benefits</li>
              <li>• Flexible working arrangements</li>
              <li>• Growth opportunities in a fast-growing company</li>
              <li>• Make a real impact in Ghana&apos;s fashion industry</li>
              <li>• Work with a passionate and diverse team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Open Positions</h2>
            <p className="text-gray-600 mb-4">
              We don&apos;t currently have any open positions, but we&apos;re always interested in 
              hearing from talented individuals. Feel free to send us your CV!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
            <p className="text-gray-600">
              Send your CV and cover letter to: <br />
              <a href="mailto:careers@rufaelan.com" className="text-blue-600 hover:text-blue-800">
                careers@rufaelan.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}