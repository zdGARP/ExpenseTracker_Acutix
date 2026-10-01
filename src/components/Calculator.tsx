import React, { useState, useRef, useEffect } from 'react';
import { Calculator as CalculatorIcon, X, Delete } from 'lucide-react';

interface CalculatorProps {
  onUseResult?: (value: number) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onUseResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInput = (val: string) => {
    if (hasError) {
      setDisplay(val);
      setEquation('');
      setHasError(false);
      return;
    }
    
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      // Prevent multiple decimals in the current number segment
      if (val === '.') {
        const parts = display.split(/[\+\-\×\÷]/);
        const currentPart = parts[parts.length - 1];
        if (currentPart.includes('.')) return;
      }
      setDisplay(display + val);
    }
  };

  const handleOperator = (op: string) => {
    if (hasError) return;
    const lastChar = display.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setDisplay(display.slice(0, -1) + op);
    } else {
      setDisplay(display + op);
    }
  };

  const calculateResult = () => {
    try {
      // Replace display operators with JS operators
      const evalString = display.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + evalString)();
      
      if (!isFinite(result)) throw new Error("Math Error");
      
      const formattedResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(4)).toString();
      
      setEquation(display + ' =');
      setDisplay(formattedResult);
      setHasError(false);
    } catch (e) {
      setHasError(true);
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setHasError(false);
  };

  const handleDelete = () => {
    if (hasError) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleUseResult = () => {
    if (!hasError && display !== '0' && !['+', '-', '×', '÷'].includes(display.slice(-1))) {
      // Try to calculate if it's an uncompleted equation
      let finalVal = display;
      if (display.match(/[\+\-\×\÷]/)) {
        try {
          const evalString = display.replace(/×/g, '*').replace(/÷/g, '/');
          // eslint-disable-next-line no-new-func
          const res = new Function('return ' + evalString)();
          finalVal = res.toString();
        } catch(e) {}
      }
      
      if (onUseResult && !isNaN(Number(finalVal))) {
        onUseResult(Number(finalVal));
        setIsOpen(false);
      }
    }
  };

  const handleToggleSign = () => {
    if (hasError || display === '0') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercentage = () => {
    if (hasError || display === '0') return;
    try {
      const val = parseFloat(display);
      setDisplay((val / 100).toString());
    } catch(e) {}
  };

  const buttons = [
    { label: 'AC', onClick: handleClear, className: 'bg-[#5e5e60] text-white hover:bg-[#737375]' },
    { label: '+/-', onClick: handleToggleSign, className: 'bg-[#5e5e60] text-white hover:bg-[#737375]' },
    { label: '%', onClick: handlePercentage, className: 'bg-[#5e5e60] text-white hover:bg-[#737375]' },
    { label: '÷', onClick: () => handleOperator('÷'), className: 'bg-[#f09a36] text-white hover:bg-[#f3ad5b]' },
    { label: '7', onClick: () => handleInput('7'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '8', onClick: () => handleInput('8'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '9', onClick: () => handleInput('9'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '×', onClick: () => handleOperator('×'), className: 'bg-[#f09a36] text-white hover:bg-[#f3ad5b]' },
    { label: '4', onClick: () => handleInput('4'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '5', onClick: () => handleInput('5'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '6', onClick: () => handleInput('6'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-[#f09a36] text-white hover:bg-[#f3ad5b]' },
    { label: '1', onClick: () => handleInput('1'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '2', onClick: () => handleInput('2'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '3', onClick: () => handleInput('3'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-[#f09a36] text-white hover:bg-[#f3ad5b]' },
    { label: '0', onClick: () => handleInput('0'), className: 'col-span-2 bg-[#757577] text-white hover:bg-[#8e8e8f] justify-start pl-[26px] rounded-bl-[10px]' },
    { label: '.', onClick: () => handleInput('.'), className: 'bg-[#757577] text-white hover:bg-[#8e8e8f]' },
    { label: '=', onClick: calculateResult, className: 'bg-[#f09a36] text-white hover:bg-[#f3ad5b] rounded-br-[10px]' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-color)] shadow-sm rounded-full text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:shadow-md transition-all font-medium text-sm"
      >
        <CalculatorIcon size={16} />
        <span>Calculator</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-200"
          onMouseDown={() => setIsOpen(false)}
        >
          <div 
            className="w-[240px] rounded-[10px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 bg-[#333333] flex flex-col font-light"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            <div className="bg-[#48484a] pt-3 pb-2 px-4 flex flex-col relative h-[90px]">
              <div className="flex gap-2 absolute top-3 left-3">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="mt-auto h-4 text-[10px] text-gray-300 text-right truncate">
                {equation}
              </div>
              <div className={`text-5xl text-right tracking-tight truncate ${hasError ? 'text-rose-400' : 'text-white'}`}>
                {display}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-[1px] bg-[#333333]">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  className={`
                    flex items-center h-12 text-xl transition-colors
                    ${btn.className?.includes('justify-start') ? '' : 'justify-center'}
                    ${btn.className || ''}
                  `}
                  style={{
                    gridColumn: btn.className?.includes('col-span-2') ? 'span 2' : 'span 1'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {onUseResult && (
              <div className="p-3 bg-[#48484a] border-t border-[#333333]">
                <button 
                  onClick={handleUseResult}
                  className="w-full py-2 bg-teal-600/20 text-teal-300 hover:bg-teal-600/40 rounded-lg text-sm transition-colors border border-teal-500/30 flex items-center justify-center gap-2"
                >
                  <CalculatorIcon size={14} />
                  Use Result
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
