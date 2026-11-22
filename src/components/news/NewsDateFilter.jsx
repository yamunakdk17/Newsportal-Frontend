import { BikramDatePicker } from '@inicrea/bikram-sambat-react';
import { X } from 'lucide-react';

import '@inicrea/bikram-sambat-react/styles.css';

export default function NewsDateFilter({ value = '', onChange }) {
  const handleDateChange = (date) => {
    onChange?.(date || '');
  };

  const clearDate = (event) => {
    event.stopPropagation();
    onChange?.('');
  };

  return (
    <div className="news-date-filter flex items-center gap-2">
      <div className="relative min-w-0 max-w-full">
        {/* <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[#164B99]" /> */}

        <BikramDatePicker
          value={value}
          onChange={handleDateChange}
          valueFormat="AD"
          locale="ne"
          format="YYYY MMMM DD, dddd"
          weekStartsOn={0}
          closeOnSelect
          editable={false}
          classNames={{
            input:
              "h-10 w-full rounded-md border border-[#164B99] bg-white px-3 pr-3 font-['Mukta',sans-serif] text-sm font-medium text-[#164B99] outline-none transition hover:bg-[#F3F7FC] focus:border-[#164B99] focus:ring-2 focus:ring-[#164B99]/10",
            popover:
              'z-[60] !left-auto !right-0 !max-w-[calc(100vw-2rem)] overflow-x-hidden',
          }}
        />
      </div>

      {value && (
        <button
          type="button"
          onClick={clearDate}
          aria-label="मिति हटाउनुहोस्"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#164B99] transition hover:bg-[#F3F7FC] hover:text-[#164B99]">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
