// components/dashboard/FollowUpTable.tsx
"use client";
import React from "react";

type FollowUp = {
  companyName?: string;
  name?: string;
  contactPersonMobile?: string;
  userName?: string;
  status?: string;
  followUpCount?: number;
  nextFollowUpDate?: string;
};

type FollowUpTableProps = {
  followups?: FollowUp[];
  role?: string;
};

export default function FollowUpTable({ followups, role }: FollowUpTableProps) {
  if (!followups || followups.length === 0)
    return null; // caller controls conditional display

  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-semibold text-[#0f766e] mb-4">
        {role === "admin" ? "Today's Follow-ups (All Users)" : "Today's Follow-ups"}
      </h3>

      <div className="akod-table-shell">
        <div className="akod-table-scroll">
        <table className="akod-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              {role === "admin" && <th>Salesperson</th>}
              <th>Status</th>
              <th>Follow-ups Count</th>
              <th>Next Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((f, i) => (
              <tr key={i}>
                <td className="font-medium">{f.companyName || f.name}</td>
                <td>{f.contactPersonMobile || "-"}</td>
                {role === "admin" && <td>{f.userName || "-"}</td>}
                <td>{f.status}</td>
                <td>{f.followUpCount ?? 0}</td>
                <td>{f.nextFollowUpDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
