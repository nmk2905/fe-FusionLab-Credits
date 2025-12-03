import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-indigo-600 text-white py-12">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Welcome to FusionLab Credits
            </h1>
            <p className="mt-3 text-lg md:text-xl opacity-90">
              Manage your credits efficiently
            </p>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Link
              to="/credits"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
            >
              <h2 className="text-xl font-semibold mb-2">Track Credits</h2>
              <p className="text-gray-600">
                Monitor your credit balance in real-time
              </p>
            </Link>

            {/* Card 2 */}
            <Link
              to="/transactions"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
            >
              <h2 className="text-xl font-semibold mb-2">Easy Transactions</h2>
              <p className="text-gray-600">
                Simple and secure credit transfers
              </p>
            </Link>

            {/* Card 3 */}
            <Link
              to="/analytics"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition block"
            >
              <h2 className="text-xl font-semibold mb-2">Analytics</h2>
              <p className="text-gray-600">
                View detailed credit usage statistics
              </p>
            </Link>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}
