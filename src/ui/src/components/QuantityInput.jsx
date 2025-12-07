export function QuantityInput({ value, onChange, min = 0, step = 0.01, placeholder = '0', ...props }) {
  return (
    <input
      type="number"
      step={step}
      min={min}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      {...props}
    />
  );
}

