import React, { useState } from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
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
} from "./select";

const DatePicker = ({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  date,
  setDate,
}) => {
  const currentDate = date || new Date();
  const [open, setOpen] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  const handleMonthChange = (month) => {
    if (!date) {
      // Jika belum ada date, buat date baru
      const newDate = new Date();
      newDate.setMonth(months.indexOf(month));
      setDate(newDate);
    } else {
      const newDate = setMonth(date, months.indexOf(month));
      setDate(newDate);
    }
  };

  const handleYearChange = (year) => {
    if (!date) {
      // Jika belum ada date, buat date baru
      const newDate = new Date();
      newDate.setFullYear(parseInt(year));
      setDate(newDate);
    } else {
      const newDate = setYear(date, parseInt(year));
      setDate(newDate);
    }
  };

  const handleSelect = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full font-inter h-11 bg-white border border-[#313131] rounded-lg px-3 justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "hover:bg-accent/10 transition-colors",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <div className="flex justify-between p-2">
          <Select
            onValueChange={handleMonthChange}
            defaultValue={months[getMonth(currentDate)]}
          >
            <SelectTrigger className="w-[110px] bg-white hover:bg-accent/50 transition-colors">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            defaultValue={getYear(currentDate).toString()}
          >
            <SelectTrigger className="w-[110px] bg-white hover:bg-accent/50 transition-colors">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          month={currentDate}
          onMonthChange={setDate}
          className="bg-white rounded-md border-none"
          classNames={{
            cell: cn(
              "relative p-0 text-center",
              "focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#F1B81C]",
            ),
            day: cn(
              "h-9 w-9 p-0 font-normal text-sm",
              "hover:bg-[#F1B81C]/40",
              "rounded-md",
              "transition-colors",
              "aria-selected:opacity-100",
            ),
            day_selected: cn(
              "bg-[#F1B81C] text-black rounded-md",
              "hover:bg-[#F1B81C]",
              "focus:bg-[#F1B81C] focus:text-black",
            ),
            day_today: cn(
              "bg-accent/20 font-semibold",
              "hover:bg-[#F1B81C]/20",
              "rounded-md",
            ),
            day_outside: cn(
              "text-muted-foreground opacity-50",
              "hover:bg-[#F1B81C]/10",
              "aria-selected:bg-[#F1B81C]/50",
            ),
            day_disabled: "text-muted-foreground opacity-50",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-xs",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
