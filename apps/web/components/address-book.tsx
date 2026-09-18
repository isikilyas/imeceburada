"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressDto, TURKISH_PROVINCES } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { Field, inputClass } from "@/components/form";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { useLocale } from "@/lib/i18n/locale-context";
import { ListSkeleton } from "@/components/list-skeleton";

interface AddressFormState {
  label: string;
  city: string;
  district: string;
  line: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormState = {
  label: "",
  city: TURKISH_PROVINCES[0],
  district: "",
  line: "",
  isDefault: false,
};

function AddressForm({
  initial,
  onCancel,
  onSubmit,
  isSubmitting,
  error,
}: {
  initial: AddressFormState;
  onCancel: () => void;
  onSubmit: (form: AddressFormState) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const { t } = useLocale();
  const [form, setForm] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-3 rounded-lg border border-ink-800 bg-ink-900 p-4"
    >
      <Field label={t("accountPanel.addresses.labelLabel")}>
        <input
          required
          placeholder={t("accountPanel.addresses.labelPlaceholder")}
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className={inputClass}
        />
      </Field>
      <ProvinceDistrictSelect
        city={form.city}
        district={form.district}
        onCityChange={(v) => setForm((prev) => ({ ...prev, city: v }))}
        onDistrictChange={(v) => setForm((prev) => ({ ...prev, district: v }))}
        allowEmptyDistrict
      />
      <Field label={t("accountPanel.addresses.lineLabel")}>
        <textarea
          required
          rows={2}
          value={form.line}
          onChange={(e) => setForm({ ...form, line: e.target.value })}
          className={inputClass}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-silver-300">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
        />
        {t("accountPanel.addresses.setDefaultLabel")}
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gold-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {isSubmitting ? t("dashboard.form.saving") : t("dashboard.form.save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-silver-400 hover:bg-ink-900"
        >
          {t("accountPanel.deactivate.cancelButton")}
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address }: { address: AddressDto }) {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
  }

  async function handleUpdate(form: AddressFormState) {
    setError(null);
    setIsSubmitting(true);
    try {
      await authFetch(`/users/me/addresses/${address.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      invalidate();
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.addresses.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetDefault() {
    try {
      await authFetch(`/users/me/addresses/${address.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      });
      invalidate();
    } catch {
      // sessizce yut — kart üstünde ufak bir eylem, ayrı bir hata alanı yok
    }
  }

  async function handleDelete() {
    if (!window.confirm(t("accountPanel.addresses.deleteConfirm"))) return;
    try {
      await authFetch(`/users/me/addresses/${address.id}`, { method: "DELETE" });
      invalidate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("accountPanel.addresses.deleteFailed"));
    }
  }

  if (editing) {
    return (
      <AddressForm
        initial={{
          label: address.label,
          city: address.city,
          district: address.district ?? "",
          line: address.line,
          isDefault: address.isDefault,
        }}
        onCancel={() => setEditing(false)}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        error={error}
      />
    );
  }

  return (
    <div className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 font-medium text-silver-200">
            {address.label}
            {address.isDefault && (
              <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-xs font-medium text-gold-400">
                {t("accountPanel.addresses.defaultBadge")}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-silver-400">{address.line}</p>
          <p className="text-xs text-silver-500">
            {address.city}
            {address.district ? ` / ${address.district}` : ""}
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-gold-400 hover:underline">
          {t("accountPanel.addresses.editButton")}
        </button>
        {!address.isDefault && (
          <button type="button" onClick={handleSetDefault} className="text-silver-400 hover:text-gold-400">
            {t("accountPanel.addresses.setDefaultButton")}
          </button>
        )}
        <button type="button" onClick={handleDelete} className="text-silver-500 hover:text-red-400">
          {t("accountPanel.addresses.deleteButton")}
        </button>
      </div>
    </div>
  );
}

/** Hesabım panelinin "Adreslerim" sekmesi — tüm roller için ortak, hesaba bağlı adres defteri. */
export function AddressBook() {
  const { t } = useLocale();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => authFetch<AddressDto[]>("/users/me/addresses"),
  });

  async function handleAdd(form: AddressFormState) {
    setAddError(null);
    setIsSubmitting(true);
    try {
      await authFetch("/users/me/addresses", {
        method: "POST",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      setAdding(false);
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : t("accountPanel.addresses.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <ListSkeleton count={2} />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-silver-500">{t("accountPanel.addresses.hint")}</p>
      {addresses?.length === 0 && !adding && (
        <p className="text-sm text-silver-500">{t("accountPanel.addresses.empty")}</p>
      )}
      {addresses?.map((address) => (
        <AddressCard key={address.id} address={address} />
      ))}

      {adding ? (
        <AddressForm
          initial={EMPTY_FORM}
          onCancel={() => setAdding(false)}
          onSubmit={handleAdd}
          isSubmitting={isSubmitting}
          error={addError}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400"
        >
          {t("accountPanel.addresses.addButton")}
        </button>
      )}
    </div>
  );
}
