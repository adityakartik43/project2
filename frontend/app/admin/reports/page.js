"use client";
import React, { useState, useEffect } from "react";
import ReportStat from "@/components/RecordStatsCard.js";
import {
  FilePieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Filter,
  FileText,
  Calendar,
} from "lucide-react";

import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    paidFlats: 0,
    pendingFlats: 0,
  });
  const [summaryTable, setSummaryTable] = useState([]);

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(88, 66, 244); // #5842F4
    doc.text("Financial Report", 14, 20);

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      14,
      28,
    );

    // Summary stats row
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(
      `Total Collected (6M): ₹${stats.totalCollected.toLocaleString()}`,
      14,
      36,
    );
    doc.text(
      `Total Pending (6M): ₹${stats.totalPending.toLocaleString()}`,
      14,
      42,
    );

    // Table
    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Period",
          "Total Collected",
          "Pending Dues",
          "Paid Flats",
          "Performance",
        ],
      ],
      body: summaryTable.map((row) => [
        row.period,
        `Rs. ${row.collected.toLocaleString()}`,
        `Rs. ${row.pending.toLocaleString()}`,
        row.ratio,
        row.perf,
      ]),
      headStyles: {
        fillColor: [88, 66, 244],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4, lineColor: [241, 245, 249], lineWidth: 0.1 },
    });

    doc.save(`Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/reports/financials`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data.success) {
          const d = res.data.data;

          setStats({
            totalCollected: d.stats.totalCollected6Months,
            totalPending: d.stats.totalPending6Months,
            paidFlats: d.stats.cumulativePaidFlats,
            pendingFlats: d.stats.currentMonthPendingFlats,
          });

          setSummaryTable(d.summaryTable);
        }
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 animate-pulse text-center">
        Loading financial data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FilePieChart className="text-[#5842F4] w-6 h-6" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Financial Reports & Analytics
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Generate and export society maintenance statements.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
          <button className="px-4 py-1.5 text-xs font-bold bg-[#5842F4] text-white rounded-lg">
            Monthly
          </button>
          <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">
            Yearly
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-100 rounded-lg">
            <Calendar size={14} /> {new Date().getFullYear()}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStat
          title="Total Collection"
          value={`₹${stats.totalCollected.toLocaleString()}`}
          sub="Last 6 Months"
          icon={TrendingUp}
          color="text-[#5842F4]"
          bg="bg-indigo-50"
          trend
        />
        <ReportStat
          title="Pending Amount"
          value={`₹${stats.totalPending.toLocaleString()}`}
          sub="Last 6 Months"
          icon={AlertCircle}
          color="text-red-500"
          bg="bg-red-50"
        />
        <ReportStat
          title="Paid Flats"
          value={stats.paidFlats}
          sub="Cumulative 6 Mos"
          icon={CheckCircle}
          color="text-green-500"
          bg="bg-green-50"
        />
        <ReportStat
          title="Pending Flats"
          value={stats.pendingFlats}
          sub="Current Month"
          icon={Filter}
          color="text-orange-500"
          bg="bg-orange-50"
        />
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center px-10">
          <h3 className="font-bold text-slate-800">Detailed Summary Table</h3>
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
            >
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
              <tr>
                <th className="px-10 py-5">Reporting Period</th>
                <th className="px-10 py-5">Total Collected</th>
                <th className="px-10 py-5">Pending Dues</th>
                <th className="px-10 py-5 text-center">Paid Flats</th>
                <th className="px-10 py-5 text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
              {summaryTable.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6 font-bold text-slate-900">
                    {item.period}
                  </td>
                  <td className="px-10 py-6 text-[#5842F4] font-bold">
                    ₹{item.collected.toLocaleString()}
                  </td>
                  <td className="px-10 py-6 text-red-500 font-bold">
                    ₹{item.pending.toLocaleString()}
                  </td>
                  <td className="px-10 py-6 text-center text-slate-500 text-sm">
                    {item.ratio}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100">
                      {item.perf}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
