export function QuantityInput({ value, onChange, min = 0, step = 0.01, placeholder = '0', ...props }) {
  return (
    <input
      type="number"
      step={step}
      min={min}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="f-input mt-2 w-full rounded-2xl px-4 py-2 text-sm"
      {...props}
    />
  );
}

