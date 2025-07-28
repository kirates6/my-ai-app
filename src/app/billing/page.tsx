import { handlePlanSelection } from '../../actions/billing'

export default function BillingPage() {
  // Define plan details
  const basicPlan = { name: 'Basic Package', amount: 10 }
  const premiumPlan = { name: 'Premium Package', amount: 25 }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">Our Pricing</h1>
      <p className="text-lg text-gray-400 mb-10">Choose a package to get started.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pricing Card 1 */}
        <form action={handlePlanSelection.bind(null, basicPlan)}>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 flex flex-col items-center text-center h-full">
            <h2 className="text-2xl font-semibold mb-4">Basic Package</h2>
            <p className="text-5xl font-bold mb-6">$10</p>
            <ul className="mb-6 text-gray-300 space-y-2">
              <li>50 High-Quality Headshots</li>
              <li>3 Unique Styles</li>
              <li>Standard Turnaround</li>
            </ul>
            <button type="submit" className="w-full mt-auto px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Select Plan
            </button>
          </div>
        </form>

        {/* Pricing Card 2 */}
        <form action={handlePlanSelection.bind(null, premiumPlan)}>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 flex flex-col items-center text-center h-full">
            <h2 className="text-2xl font-semibold mb-4">Premium Package</h2>
            <p className="text-5xl font-bold mb-6">$25</p>
            <ul className="mb-6 text-gray-300 space-y-2">
              <li>150 High-Quality Headshots</li>
              <li>10 Unique Styles</li>
              <li>Priority Turnaround</li>
            </ul>
            <button type="submit" className="w-full mt-auto px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Select Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}