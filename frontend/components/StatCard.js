const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className={`p-5 rounded-2xl bg-white border border-slate-100 flex justify-between items-center shadow-sm`}>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}>
      <Icon size={20} className={color} />
    </div>
  </div>
);

export default StatCard;