import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press - RUFA ELAN",
  description: "Press releases, news, and media coverage about RUFA ELAN.",
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Press & Media</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About RUFA ELAN</h2>
            <p className="text-gray-600 leading-7">
              RUFA ELAN is Ghana&apos;s leading online fashion retailer, specializing in quality and 
              affordable ladies fashion. Founded with a mission to make fashion accessible to all 
              Ghanaian women, we provide nationwide delivery with trusted payment options and 
              exceptional customer support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Press Inquiries</h2>
            <p className="text-gray-600 mb-4">
              For media inquiries, interviews, or press releases, please contact our press team:
            </p>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-800 font-medium">Press Contact</p>
              <p className="text-gray-600">Email: press@rufaelan.com</p>
              <p className="text-gray-600">Phone: +90 505 378 3510</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Assets</h2>
            <p className="text-gray-600 mb-4">
              Download our brand assets for media use:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Company logos (high resolution)</li>
              <li>• Product images</li>
              <li>• Executive photos</li>
              <li>• Brand guidelines</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              All assets are available upon request. Please contact our press team for access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent News</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-gray-800">RUFA ELAN Expands Nationwide Delivery</h3>
                <p className="text-gray-600 text-sm mt-2">
                  We&apos;ve expanded our delivery network to serve all regions of Ghana with faster, 
                  more reliable shipping options.
                </p>
                <p className="text-gray-500 text-sm mt-2">March 2024</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}