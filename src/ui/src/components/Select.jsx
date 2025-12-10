import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const commonUnits = ['timer', 'stk', 'm²', 'kg', 'l', 'm', 'km', 'dag', 'uke', 'måned', 'år'];

export function Select({ value, onChange, options = [], placeholder = 'Velg...', allowCustom = false, customLabel = 'Tilpasset' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const allOptions = allowCustom ? [...options, { value: '__custom__', label: customLabel }] : options;
  
  // Helper to get option label (supports both string and object with label property)
  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option?.label || option?.value || '';
  };
  
  // Helper to get option icon (if provided)
  const getOptionIcon = (option) => {
    if (typeof option === 'string') return null;
    return option?.icon || null;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedDropdown = dropdownRef.current?.contains(event.target);
      
      if (!clickedButton && !clickedDropdown) {
        setIsOpen(false);
        setShowCustomInput(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate dropdown position when opening and on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => {
    const optValue = typeof opt === 'string' ? opt : opt.value;
    return optValue === value;
  }) || (value && !options.find((opt) => {
    const optValue = typeof opt === 'string' ? opt : opt.value;
    return optValue === value;
  }) ? { label: value, value } : null);

  const handleSelect = (optionValue) => {
    if (optionValue === '__custom__') {
      setShowCustomInput(true);
      const hasValue = options.find((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === value;
      });
      setCustomValue(value && !hasValue ? value : '');
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setShowCustomInput(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange?.(customValue.trim());
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] rounded-2xl border border-sand bg-white shadow-lg"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      {!showCustomInput ? (
        <div className="max-h-60 overflow-y-auto p-1">
          {allOptions.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = getOptionLabel(option);
            const optionIcon = getOptionIcon(option);
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => handleSelect(optionValue)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  value === optionValue
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-soft hover:bg-cloud'
                }`}
              >
                {optionIcon && <span className="flex-shrink-0">{optionIcon}</span>}
                {optionLabel}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-3">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomSubmit();
              } else if (e.key === 'Escape') {
                setShowCustomInput(false);
                setIsOpen(false);
              }
            }}
            placeholder="Skriv inn enhet"
            className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="flex-1 rounded-xl bg-brand-700 px-3 py-1.5 text-sm font-medium text-white"
            >
              Lagre
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomValue('');
              }}
              className="flex-1 rounded-xl border border-sand bg-white px-3 py-1.5 text-sm font-medium text-ink-soft"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <span className={`flex items-center gap-2 ${selectedOption ? 'text-ink' : 'text-ink-subtle'}`}>
            {selectedOption && getOptionIcon(selectedOption) && (
              <span className="flex-shrink-0">{getOptionIcon(selectedOption)}</span>
            )}
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>
        </button>
      </div>
      {typeof document !== 'undefined' && isOpen && createPortal(dropdownContent, document.body)}
    </>
  );
}

export function UnitSelect({ value, onChange, placeholder = 'Velg enhet' }) {
  const unitOptions = commonUnits.map((unit) => ({ value: unit, label: unit }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={unitOptions}
      placeholder={placeholder}
      allowCustom={true}
      customLabel="Tilpasset enhet"
    />
  );
}

