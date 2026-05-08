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
    <div className="order-timeline">
      {steps.map((step, index) => {
        let stepClass = '';
        if (index < currentIndex) stepClass = 'completed';
        else if (index === currentIndex) stepClass = 'current';

        return (
          <div key={step.key} className={`timeline-step ${stepClass}`}>
            <div className="timeline-dot">
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className="timeline-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
