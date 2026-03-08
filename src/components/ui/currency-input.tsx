"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
    id?: string;
    name?: string;
    label?: string;
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

/**
 * A currency input that automatically formats with thousands separators
 * and shows the ₦ prefix
 */
export function CurrencyInput({
    id,
    name,
    label,
    value,
    onChange,
    placeholder = "0",
    className,
    disabled,
    required,
    error,
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState(() =>
        value ? value.toLocaleString('en-NG') : ''
    );

    // Update display when external value changes
    useEffect(() => {
        const init = async () => {
            if (value !== parseFloat(displayValue.replace(/,/g, ''))) {
                setDisplayValue(value ? value.toLocaleString('en-NG') : '');
            }
        };
        void init();
    }, [value, displayValue]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        const num = parseInt(raw, 10) || 0;

        // Update display with formatted value
        setDisplayValue(num ? num.toLocaleString('en-NG') : '');

        // Pass numeric value to parent
        onChange(num);
    }, [onChange]);

    const handleBlur = useCallback(() => {
        // Ensure proper formatting on blur
        const num = parseFloat(displayValue.replace(/,/g, '')) || 0;
        setDisplayValue(num ? num.toLocaleString('en-NG') : '');
    }, [displayValue]);

    const inputId = id || name || 'currency-input';

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={inputId}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    ₦
                </span>
                <Input
                    id={inputId}
                    name={name}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "pl-7 font-mono",
                        error && "border-destructive"
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            </div>
            {error && (
                <p id={`${inputId}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
