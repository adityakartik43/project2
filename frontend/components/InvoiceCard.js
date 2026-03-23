import Link from "next/link";
import { 
  CheckCircle2, Calendar, Download, CreditCard, Banknote
} from "lucide-react";

const InvoiceCard = ({ invoice, totalAmount }) => {
  return (
    <>
      {/* Main Paper / Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        {/* Top colored strip based on status */}
        <div
          className={`h-2 w-full ${invoice.status === "PAID" ? "bg-green-500" : "bg-orange-500"}`}
        />

        <div className="p-8 md:p-12">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-1">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Invoice
              </h1>
              <p className="text-slate-400 font-medium text-sm flex items-center gap-1.5">
                <span className="text-slate-600">No:</span> {invoice.invoiceNo}
              </p>
              <p className="text-slate-400 font-medium text-sm">
                <span className="text-slate-600">Period:</span>{" "}
                {invoice.billingPeriod}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-end gap-3 text-right">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border 
                  ${
                    invoice.status === "PAID"
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                  }`}
              >
                {invoice.status === "PAID" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Calendar size={18} />
                )}
                {invoice.status}
              </div>

              {invoice.status === "PAID" && (
                <button className="flex items-center gap-1.5 text-[#5842F4] bg-indigo-50 hover:bg-[#5842F4] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                  <Download size={14} /> Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Billing Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Billed To
              </p>
              <p className="text-base font-bold text-slate-800">Flat A-101</p>
              <p className="text-sm text-slate-500">Resident Name</p>
            </div>

            <div className="md:text-right">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Payment Detail
              </p>
              {invoice.status === "PAID" ? (
                <>
                  <p className="text-base font-bold text-slate-800 flex items-center md:justify-end gap-1.5">
                    <CreditCard size={14} className="text-[#5842F4]" />{" "}
                    {invoice.paymentMode}
                  </p>
                  <p className="text-sm text-slate-500">
                    Paid on {invoice.paymentDate}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Ref: {invoice.transactionId}
                  </p>
                </>
              ) : (
                <div className="flex flex-col md:items-end">
                  <p className="text-base font-bold text-slate-800">
                    Payment Pending
                  </p>
                  <Link
                    href="/resident/pay-bill"
                    className="text-sm text-[#5842F4] font-bold hover:underline mt-1"
                  >
                    Pay Now &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mb-12">
            <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-2">
              Charge Breakdown
            </h3>

            <div className="space-y-4">
              {invoice.charges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex justify-between items-center group"
                >
                  <div className="flex gap-4 items-start">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-[#5842F4] transition-colors shrink-0">
                      {charge.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm md:text-base">
                        {charge.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {charge.desc}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-800">
                      ₹{charge.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-6 flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Total Amount Payable
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                <Banknote size={14} /> Includes all taxes
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-[#5842F4]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer of the Paper */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400">
            For any discrepancies in the billing, please contact the society
            management office or raise a ticket from the dashboard.
          </p>
        </div>
      </div>
    </>
  );
};

export default InvoiceCard;
