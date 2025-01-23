import React from 'react';
import { Shield, CreditCard, Send, PieChart } from 'lucide-react';

const features = [
  {
    name: 'Secure Transactions',
    description: 'Bank-grade encryption and security protocols to keep your money safe.',
    icon: Shield,
  },
  {
    name: 'Virtual Cards',
    description: 'Create virtual cards for online shopping with customizable limits.',
    icon: CreditCard,
  },
  {
    name: 'Instant Transfers',
    description: 'Send money instantly to anyone, anywhere in the world.',
    icon: Send,
  },
  {
    name: 'Smart Analytics',
    description: 'Track your spending and get insights to make better financial decisions.',
    icon: PieChart,
  },
];

export default function Features() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need in a modern bank
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}