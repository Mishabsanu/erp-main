"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { updateSaleStatus } from "@/services/salesApi";
import { toast } from "sonner";

export default function StatusUpdateModal({ sale, onClose, onUpdated }: any) {
  const [status, setStatus] = useState(sale.status);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    sale.nextFollowUpDate || ""
  );
  const [remarks, setRemarks] = useState("");

  const statuses = [
    "New Lead",
    "Call Required",
    "Contacted",
    "Follow-Up",
    "Quotation Sent",
    "Negotiation",
    "Interested",
    "Not Interested",
    "On Hold",
    "PO Received",
    "Payment Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const handleSubmit = async () => {
    try {
      const loading = toast.loading("Updating...");

      const res = await updateSaleStatus(sale._id, {
        status,
        nextFollowUpDate,
        remarks,
      });

      toast.dismiss(loading);

      if (res.success) {
        toast.success("Status updated!");
        onUpdated();
        onClose();
      } else {
        toast.error("Failed to update.");
      }
    } catch (e) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0f766e]" />
          Update Follow-Up
        </h2>

        {/* STATUS */}
        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0f766e]/10 focus:border-[#0f766e] outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* FOLLOW UP DATE */}
        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Next Follow-Up Date
          </label>
          <input
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0f766e]/10 focus:border-[#0f766e] outline-none"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* REMARKS */}
        <div className="space-y-1 mb-6">
          <label className="text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0f766e]/10 focus:border-[#0f766e] outline-none"
            placeholder="Write notes..."
          ></textarea>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#0f766e] text-white rounded-lg hover:bg-[#134e4a] shadow-md transition-all active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
