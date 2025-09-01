'use client';

import { useState } from 'react';
import { Instagram, CheckCircle, ArrowRight, ExternalLink, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function InstagramOnboardingModal({ isOpen, onClose, onConnect }: Props) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Instagram Business Account Required",
      description: "You need an Instagram Business account connected to a Facebook Page to use our automation features.",
      action: (
        <a
          href="https://business.instagram.com/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm"
        >
          Learn how to set up Business account <ExternalLink className="h-4 w-4" />
        </a>
      )
    },
    {
      title: "Connect Your Facebook Page",
      description: "Your Instagram Business account must be connected to a Facebook Page that you manage.",
      action: (
        <a
          href="https://www.facebook.com/business/help/898752960195806"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm"
        >
          View connection guide <ExternalLink className="h-4 w-4" />
        </a>
      )
    },
    {
      title: "Grant Permissions",
      description: "We'll need permissions to manage your Instagram messages and comments to provide automation features.",
      action: null
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Instagram className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Connect Instagram</h2>
          <p className="text-gray-600 mt-2">Follow these steps to connect your Instagram Business account</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((stepInfo, index) => (
            <div key={index} className={`flex gap-4 ${index + 1 === step ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                index + 1 < step ? 'bg-green-100 text-green-600' : 
                index + 1 === step ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1 < step ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{stepInfo.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{stepInfo.description}</p>
                {stepInfo.action && (
                  <div className="mt-2">
                    {stepInfo.action}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {step < steps.length ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              Connect Instagram <Instagram className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> You&apos;ll be redirected to Facebook to authorize the connection. 
            Make sure you&apos;re logged into the Facebook account that manages your Instagram Business account.
          </p>
        </div>
      </div>
    </div>
  );
}