import { CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

function formatDateForApi(date) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date) {
  if (!date) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function NewsDateFilter({ value = '', onChange }) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  const handleDateSelect = (date) => {
    if (!date) {
      onChange?.('');
      return;
    }

    onChange?.(formatDateForApi(date));
  };

  const clearDate = (event) => {
    event.stopPropagation();
    onChange?.('');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 min-w-[190px] justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" />

            <span className="truncate">
              {selectedDate ? formatDateForDisplay(selectedDate) : 'Filter by date'}
            </span>
          </span>

          {selectedDate && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selected date"
              className="ml-1 rounded-sm p-0.5 hover:bg-muted"
              onClick={clearDate}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  clearDate(event);
                }
              }}>
              <X className="h-4 w-4" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
