function RecordStat({ title, value, icon: Icon, color, bg, border = "border-slate-100" }) {
  return (
    <div className={`${bg} p-6 rounded-[1.5rem] border ${border} shadow-sm flex items-center justify-between transition-transform hover:scale-[1.01]`}>
      <div>
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm ${color}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export default RecordStat