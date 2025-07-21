
"use client";

import * as React from "react";
import { format, getYear, getMonth, setYear, setMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleYearChange = (year: string) => {
    const newDate = value ? setYear(value, parseInt(year)) : new Date(parseInt(year), 0, 1);
    onChange(newDate);
  };
  
  const handleMonthChange = (monthIndex: string) => {
    const newDate = value ? setMonth(value, parseInt(monthIndex)) : new Date(toYear, parseInt(monthIndex), 1);
    onChange(newDate);
  };
  

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 flex gap-2">
            <Select
                onValueChange={handleYearChange}
                value={value ? String(getYear(value)) : undefined}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60">
                    {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select
                onValueChange={handleMonthChange}
                value={value ? String(getMonth(value)) : undefined}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent position="popper">
                    {months.map((month, i) => (
                        <SelectItem key={month} value={String(i)}>
                            {month}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            if (date) {
                setOpen(false);
            }
          }}
          disabled={disabled}
          month={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
