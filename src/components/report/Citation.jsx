import React from 'react';

export default function Citation({ id, label }) {
  const handleClick = (e) => {
    e.preventDefault();
    const sourceEl = document.getElementById(`source-item-${id}`);
    if (sourceEl) {
      sourceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sourceEl.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-500/10');
      setTimeout(() => {
        sourceEl.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-500/10');
      }, 2000);
    }
  };

  return (
    <a
      href={`#source-item-${id}`}
      onClick={handleClick}
      title={`Jump to Source [${id}]`}
      className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-white transition-all cursor-pointer select-none"
    >
      [{label || id}]
    </a>
  );
}
