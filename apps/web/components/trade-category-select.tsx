"use client";

import { useEffect, useState } from "react";
import { TRADE_FIELDS } from "@bau360/shared";
import { Field, selectClass } from "@/components/form";

interface TradeCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}

function findLocation(value: string) {
  for (const field of TRADE_FIELDS) {
    for (const branch of field.branches) {
      if (branch.professions.some((p) => p.value === value)) {
        return { fieldLabel: field.label, branchLabel: branch.label };
      }
    }
  }
  return null;
}

export function TradeCategorySelect({ value, onChange, allowEmpty = false }: TradeCategorySelectProps) {
  const located = findLocation(value);
  const [fieldLabel, setFieldLabel] = useState(
    located?.fieldLabel ?? (allowEmpty ? "" : TRADE_FIELDS[0].label),
  );
  const [branchLabel, setBranchLabel] = useState(
    located?.branchLabel ?? (allowEmpty ? "" : TRADE_FIELDS[0].branches[0].label),
  );

  useEffect(() => {
    const loc = findLocation(value);
    if (loc) {
      setFieldLabel(loc.fieldLabel);
      setBranchLabel(loc.branchLabel);
    }
  }, [value]);

  const field = TRADE_FIELDS.find((f) => f.label === fieldLabel);
  const branches = field?.branches ?? [];
  const branch = branches.find((b) => b.label === branchLabel);
  const professions = branch?.professions ?? [];

  function handleFieldChange(nextFieldLabel: string) {
    setFieldLabel(nextFieldLabel);
    const nextField = TRADE_FIELDS.find((f) => f.label === nextFieldLabel);
    const nextBranch = nextField?.branches[0];
    if (allowEmpty || !nextBranch) {
      setBranchLabel("");
      onChange("");
    } else {
      setBranchLabel(nextBranch.label);
      onChange(nextBranch.professions[0]?.value ?? "");
    }
  }

  function handleBranchChange(nextBranchLabel: string) {
    setBranchLabel(nextBranchLabel);
    const nextBranch = branches.find((b) => b.label === nextBranchLabel);
    if (allowEmpty || !nextBranch) {
      onChange("");
    } else {
      onChange(nextBranch.professions[0]?.value ?? "");
    }
  }

  return (
    <div className="space-y-3">
      <Field label="Çalışma Alanı">
        <select value={fieldLabel} onChange={(e) => handleFieldChange(e.target.value)} className={selectClass}>
          {allowEmpty && <option value="">Tüm Alanlar</option>}
          {TRADE_FIELDS.map((f) => (
            <option key={f.label} value={f.label}>
              {f.icon} {f.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Branş">
        <select
          value={branchLabel}
          onChange={(e) => handleBranchChange(e.target.value)}
          disabled={!fieldLabel}
          className={selectClass}
        >
          {allowEmpty && <option value="">Tüm Branşlar</option>}
          {branches.map((b) => (
            <option key={b.label} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Meslek">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!branchLabel}
          className={selectClass}
        >
          {allowEmpty && <option value="">Tüm Meslekler</option>}
          {professions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}