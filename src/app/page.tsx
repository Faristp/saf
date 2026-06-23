import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated =
    Boolean(cookieStore.get("auth")) ||
    Boolean(cookieStore.get("session")) ||
    Boolean(cookieStore.get("token")) ||
    Boolean(cookieStore.get("authorization"));

  if (isAuthenticated) {
    redirect("/invoices");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SAF Invoice Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage and view your sales invoices with ease
          </p>

          {isAuthenticated ? (
            <Link
              href="/invoices"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              View All Invoices →
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">📋</div>
            <h3 className="text-lg font-semibold mb-2">Invoice Listing</h3>
            <p className="text-gray-600">
              Browse all your sales invoices with key information at a glance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Detailed View</h3>
            <p className="text-gray-600">
              Click on any invoice to see full line items and payment details
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">💾</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Data</h3>
            <p className="text-gray-600">
              Access the latest invoice data from your system in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
