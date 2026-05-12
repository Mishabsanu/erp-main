type FollowUp = {
  name?: string;
  contactPersonMobile?: string;
  user?: { name?: string };
};

type PendingQuote = {
  name?: string;
  totalSellingPrice?: string | number;
  status?: string;
};

type DashboardTableData = {
  role?: 'admin' | 'sales' | 'finance' | string;
  followupList?: FollowUp[];
  pendingQuotes?: PendingQuote[];
};

export default function DashboardTable({ data }: { data: DashboardTableData }) {
  return (
    <div className="card-premium p-6">
      <h2 className="text-xl font-semibold text-[#0f766e] mb-5">
        {data.role === 'admin' && "Today's Follow-ups (All Users)"}
        {data.role === 'sales' && 'My Follow-ups'}
        {data.role === 'finance' && 'Pending Quotes'}
      </h2>

      <div className="akod-table-shell">
        <div className="akod-table-scroll">
        <table className="akod-table">
          <thead>
            <tr>
              {data.role !== 'finance' ? (
                <>
                  <th>Client</th>
                  <th>Contact</th>
                  {data.role === 'admin' && <th>Salesperson</th>}
                </>
              ) : (
                <>
                  <th>Client</th>
                  <th>Total Selling Price</th>
                  <th>Status</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {data.role !== 'finance'
              ? data.followupList?.map((f, i) => (
                  <tr key={i}>
                    <td>{f.name}</td>
                    <td>{f.contactPersonMobile}</td>
                    {data.role === 'admin' && <td>{f.user?.name || '-'}</td>}
                  </tr>
                ))
              : data.pendingQuotes?.map((q, i) => (
                  <tr key={i}>
                    <td>{q.name}</td>
                    <td>{q.totalSellingPrice}</td>
                    <td>{q.status}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
