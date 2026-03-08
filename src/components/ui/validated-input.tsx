"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    validationRules?: ValidationRule[];
    helperText?: string;
}

const commonValidationRules = {
    required: (message = "This field is required"): ValidationRule => ({
        validate: (value) => value.trim().length > 0,
        message,
    }),
    email: (message = "Please enter a valid email"): ValidationRule => ({
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message,
    }),
    minLength: (length: number, message?: string): ValidationRule => ({
        validate: (value) => value.length >= length,
        message: message || `Must be at least ${length} characters`,
    }),
    phone: (message = "Please enter a valid phone number"): ValidationRule => ({
        validate: (value) => /^[\d+\-() ]{10,}$/.test(value),
        message,
    }),
    numeric: (message = "Please enter a valid number"): ValidationRule => ({
        validate: (value) => /^\d+$/.test(value),
        message,
    }),
};

/**
 * Input component with built-in inline validation on blur
 * Shows validation state with icons and error messages
 */
export function ValidatedInput({
    label,
    name,
    validationRules = [],
    helperText,
    className,
    required,
    onChange,
    ...props
}: ValidatedInputProps) {
    const [value, setValue] = useState((props.defaultValue as string) || "");
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = useCallback((val: string): string | null => {
        // Add required rule if prop is set
        const rules = required
            ? [commonValidationRules.required(), ...validationRules]
            : validationRules;

        for (const rule of rules) {
            if (!rule.validate(val)) {
                return rule.message;
            }
        }
        return null;
    }, [validationRules, required]);

    const handleBlur = useCallback(() => {
        setTouched(true);
        const validationError = validate(value);
        setError(validationError);
    }, [value, validate]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        // Clear error while typing if it was previously valid
        if (touched && error) {
            const validationError = validate(newValue);
            if (!validationError) {
                setError(null);
            }
        }

        // Call original onChange if provided
        onChange?.(e);
    }, [touched, error, validate, onChange]);

    const isValid = touched && !error && value.length > 0;
    const showError = touched && !!error;

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={name} className="flex items-center gap-1">
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <Input
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        "pr-9",
                        showError && "border-destructive focus-visible:ring-destructive",
                        isValid && "border-green-500 focus-visible:ring-green-500"
                    )}
                    aria-invalid={showError}
                    aria-describedby={showError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
                    {...props}
                />
                {isValid && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {showError && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
            </div>
            {showError && (
                <p id={`${name}-error`} className="text-sm text-destructive flex items-center gap-1">
                    {error}
                </p>
            )}
            {helperText && !showError && (
                <p id={`${name}-helper`} className="text-sm text-muted-foreground">
                    {helperText}
                </p>
            )}
        </div>
    );
}

// Export common validation rules for reuse
export { commonValidationRules };
