export default function AdminDashboard() {
  return (
    <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">System Overview</h2>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Total Users</p>
                <p className="text-2xl font-bold mt-2 text-slate-900">1,204</p>
            </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Active Partners</p>
                <p className="text-2xl font-bold mt-2 text-slate-900">45</p>
            </div>
        </div>
    </div>
  );
}
