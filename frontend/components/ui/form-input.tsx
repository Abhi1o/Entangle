"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	required?: boolean;
	error?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
	({ className, label, required, error, ...props }, ref) => {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
						{label} {required && "*"}
					</label>
				)}
				<input
					className={cn(
						"flex h-10 w-full rounded-full border border-gray-600 bg-transparent px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
						error && "border-red-500 focus:ring-red-500",
						className
					)}
					ref={ref}
					{...props}
				/>
				{error && <p className="text-xs text-red-400">{error}</p>}
			</div>
		);
	}
);
FormInput.displayName = "FormInput";

export { FormInput };
