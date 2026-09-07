import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intellectual Property Policy - RUFA ELAN",
  description: "RUFA ELAN's intellectual property policy and copyright information.",
};

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Intellectual Property Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Copyright Policy</h2>
            <p className="text-gray-600 leading-7 mb-4">
              RUFA ELAN respects the intellectual property rights of others and expects our users 
              to do the same. We will respond to clear notices of alleged copyright infringement 
              that comply with applicable law.
            </p>
            <p className="text-gray-600 leading-7">
              All content on our website, including but not limited to text, graphics, logos, 
              images, and software, is the property of RUFA ELAN or its content suppliers and 
              is protected by Ghanaian and international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trademark Information</h2>
            <p className="text-gray-600 leading-7 mb-4">
              RUFA ELAN, the RUFA ELAN logo, and other marks indicated on our website are 
              trademarks of RUFA ELAN. Other trademarks, service marks, and trade names that 
              may appear on our website are the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images and Descriptions</h2>
            <p className="text-gray-600 leading-7 mb-4">
              Product images and descriptions on our website are for reference only. We work 
              with various suppliers and manufacturers, and we ensure that all products sold 
              comply with applicable intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Copyright Infringement Claims</h2>
            <p className="text-gray-600 leading-7 mb-4">
              If you believe that your copyrighted work has been copied and is accessible on 
              our website in a way that constitutes copyright infringement, please notify us 
              immediately.
            </p>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
              <p className="text-gray-600">Email: legal@rufaelan.com</p>
              <p className="text-gray-600">Subject: Copyright Infringement Claim</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User-Generated Content</h2>
            <p className="text-gray-600 leading-7">
              By submitting content to our website (including reviews, comments, or images), 
              you grant RUFA ELAN a non-exclusive, royalty-free, worldwide license to use, 
              reproduce, modify, and distribute such content in connection with our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600 leading-7">
              We may update this Intellectual Property Policy from time to time. Any changes 
              will be posted on this page with an updated revision date.
            </p>
            <p className="text-gray-500 text-sm mt-4">Last updated: March 2024</p>
          </section>
        </div>
      </div>
    </div>
  );
}