export default function OrderTimeline({ status }) {
  const steps = [
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center justify-between w-full py-8 overflow-x-auto custom-scrollbar">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 min-w-[80px] relative">
            {/* Connector Line */}
            {index !== 0 && (
              <div 
                className={`absolute left-[-50%] right-[50%] top-4 h-[1px] -z-10 ${
                  isCompleted || isCurrent ? 'bg-black' : 'bg-zinc-200'
                }`} 
              />
            )}
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              isCompleted ? 'bg-black text-white' : 
              isCurrent ? 'bg-black text-white scale-110 ring-4 ring-zinc-50' : 
              'bg-white border border-zinc-200 text-zinc-400'
            }`}>
              {isCompleted ? '✓' : index + 1}
            </div>
            
            <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold text-center ${
              isCurrent ? 'text-black' : 'text-zinc-400'
            }`}>
              {step.label.replace(/_/g, ' ')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
