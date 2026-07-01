export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">
        Privacy Policy
      </h1>

      <p className="mb-6 text-gray-700">
        Welcome to JewelCancy! We are committed to protecting your personal information and
        your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data.
      </p>

      {/* Information We Collect */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Information We Collect
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personal details such as name, email, phone number</li>
          <li>Resume and professional information</li>
          <li>Company or employer details (for recruiters)</li>
          <li>Usage data like IP address and browser type</li>
          <li>Security login logs such as approximate IP-based city/country, device, browser, and login time</li>
        </ul>
      </section>

      {/* How We Use Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          How We Use Your Information
        </h2>
        <p className="mb-3">
          Your data is used to improve site functionality and job opportunities, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Creating and managing user accounts</li>
          <li>Connecting job seekers with employers</li>
          <li>Enhancing user experience through analytics</li>
          <li>Sending notifications and service updates</li>
        </ul>
      </section>

      {/* Login Security Logs */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Login Security & Approximate Location
        </h2>
        <p className="mb-3">
          To protect accounts and detect suspicious access, JewelCancy records login activity such as IP address,
          device/browser details, login time, and approximate location based on IP address. This is not exact live GPS
          tracking, and we do not require browser location permission for login.
        </p>
        <p>
          Normal users see masked IP addresses in their account security page. Admins may view full IP addresses for
          security investigation, audit, and abuse prevention. Login activity logs are retained only for the configured
          security retention period.
        </p>
      </section>

      {/* Data Sharing & Security */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Data Sharing & Security
        </h2>
        <p>
          We do not sell your personal information. Data may be shared only with trusted employers or
          partners for job-related purposes. We use encryption and security measures to prevent unauthorized access.
        </p>
      </section>

      {/* Privacy Rights */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Your Privacy Rights
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You can update or delete your profile anytime</li>
          <li>You can request a copy of your stored data</li>
          <li>You can opt out of marketing emails</li>
        </ul>
      </section>

      {/* Changes to Policy */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Changes to This Policy
        </h2>
        <p>
          We may update this policy when necessary. Continued use of our website means you accept the revised terms.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Contact Us
        </h2>
        <p>
          If you have questions about our Privacy Policy, please contact us at: <br />
          <strong className="text-blue-700">support@jewelcancy.com</strong>
        </p>
      </section>

    </div>
  );
}
