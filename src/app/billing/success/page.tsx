export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Request Received!</h1>
      <p className="text-lg text-gray-300 max-w-xl">
        Thank you for selecting a plan. We will send a payment request from our partner, Payoneer, to your email address shortly to complete the purchase.
      </p>
    </div>
  )
}