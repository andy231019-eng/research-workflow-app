'use client'

import type { SpecialIndustryFramework } from "@/types/research";
import { SPECIAL_FRAMEWORKS } from "@/types/research";

interface Props {
  value: SpecialIndustryFramework;
  onChange: (value: SpecialIndustryFramework) => void;
}

export default function SpecialFrameworkSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {SPECIAL_FRAMEWORKS.map((fw) => {
        const isSelected = value === fw.id;
        return (
          <button
            key={fw.id}
            type="button"
            onClick={() => onChange(fw.id)}
            className={`text-left rounded-lg border p-3 transition ${
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            <span className="block text-sm font-medium">{fw.label}</span>
            <span className={`block text-xs mt-1 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
              {fw.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
