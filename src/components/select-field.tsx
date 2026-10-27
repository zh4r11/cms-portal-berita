"use client";

import InputError from "@/components/input-error";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Option = {
  value: string;
  label: string;
};

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <SimpleSelect id={id} value={value} onChange={onChange} options={options} placeholder={placeholder} invalid={!!error} />
      <InputError message={error} />
    </div>
  );
}

export function SimpleSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  className = "w-full",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={className} aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
