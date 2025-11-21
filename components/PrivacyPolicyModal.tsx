import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      <div
        className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-8 max-w-2xl w-full mx-4 relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-3xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 id="privacy-title" className="text-2xl font-orbitron font-bold text-cyan mb-4">
          Privacy Policy
        </h2>

        <div className="text-gray-300 space-y-4 text-sm">
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <p>
            Welcome to gnidoC terceS ("we", "our", "us"). We are committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website.
          </p>

          <h3 className="font-bold text-lg text-gray-100 pt-2">1. Information We Collect</h3>
          <p>
            We may collect personal information from you in a variety of ways, including, but not
            limited to, when you use our services, or communicate with us. The types of personal
            information we may collect include your name, email address, and any other information
            you choose to provide.
          </p>

          <h3 className="font-bold text-lg text-gray-100 pt-2">2. How We Use Your Information</h3>
          <p>
            We may use the information we collect from you to:
            <ul className="list-disc list-inside pl-4 mt-2">
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Understand and analyze how you use our services.</li>
              <li>Send you emails and other communications.</li>
              <li>Find and prevent fraud.</li>
            </ul>
          </p>

          <h3 className="font-bold text-lg text-gray-100 pt-2">3. Sharing Your Information</h3>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your Personally
            Identifiable Information unless we provide users with advance notice. This does not
            include website hosting partners and other parties who assist us in operating our
            website, conducting our business, or serving our users, so long as those parties agree
            to keep this information confidential.
          </p>

          <h3 className="font-bold text-lg text-gray-100 pt-2">4. Security of Your Information</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your
            personal information. While we have taken reasonable steps to secure the personal
            information you provide to us, please be aware that despite our efforts, no security
            measures are perfect or impenetrable, and no method of data transmission can be
            guaranteed against any interception or other type of misuse.
          </p>

          <h3 className="font-bold text-lg text-gray-100 pt-2">5. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href="mailto:privacy@gnidoc.xyz" className="text-cyan hover:underline">
              privacy@gnidoc.xyz
            </a>
            .
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 text-sm bg-cyan text-dark-bg font-bold rounded-full hover:bg-cyan/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicyModal);
