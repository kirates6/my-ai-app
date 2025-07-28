import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';
import { updatePaymentStatus } from '@/actions/billing';

// This function fetches the payment requests from your database
async function getPaymentRequests() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*, userTable(email)')
    // Request #3: Orders the requests to show the newest first
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error.message);
    return { payments: [], error: error.message };
  }
  return { payments: data, error: null };
}

// This is the UI component for your admin page
export default async function AdminPage() {
  const { payments, error } = await getPaymentRequests();

  if (error) {
    return <div className="p-8 text-center text-red-600">Error fetching data: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-md text-gray-600 mt-1">Review and manage all pending payment requests.</p>
      </header>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-gray-900">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            {/* Request #2: Each request is shown in its own distinct table row */}
            <tbody className="bg-white divide-y divide-gray-200">
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Request #1: Hides the email and shows "Fulfilled" if the status is 'paid' */}
                      {payment.status === 'paid' ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-500">Fulfilled</span>
                        </div>
                      ) : (
                        <>
                          {/* @ts-ignore */}
                          <div className="text-sm font-medium">{payment.userTable?.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                            {new Date(payment.created_at).toLocaleString()}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{payment.plan_name}</div>
                      <div className="text-sm text-gray-500">${payment.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <form action={updatePaymentStatus.bind(null, payment.id, payment.user_id)}>
                        <button type="submit" className="flex items-center text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed" disabled={payment.status !== 'pending'}>
                          <CheckCircle className="mr-2 h-5 w-5"/>
                          Mark as Paid
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No payment requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}