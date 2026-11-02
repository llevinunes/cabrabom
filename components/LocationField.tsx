"use client";

import { useEffect, useRef, useState } from "react";
import { Field, FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { CEP_MAX_LENGTH, formatCep } from "@/lib/location/cep-format";

type State =
  | { mode: "idle" }
  | { mode: "locating" }
  | { mode: "gps"; lat: number; lng: number }
  | { mode: "cep"; reason?: string };

/**
 * "Usar minha localização" with the browser's GPS, or a CEP field as the alternative.
 * Writes hidden inputs read on the server by readLocationInput().
 */
export function LocationField({
  label,
  hint = "ou informe o CEP",
  error,
  defaultCep,
  defaultPosition,
}: {
  label: string;
  hint?: string;
  error?: string;
  defaultCep?: string;
  /** A position already chosen (e.g. coming back from the results): starts as "Localização definida". */
  defaultPosition?: { lat: number; lng: number } | null;
}) {
  const [state, setState] = useState<State>(
    defaultCep ? { mode: "cep" } : defaultPosition ? { mode: "gps", ...defaultPosition } : { mode: "idle" },
  );
  const [cep, setCep] = useState(() => formatCep(defaultCep ?? ""));
  const container = useRef<HTMLFieldSetElement>(null);
  const switchedByUser = useRef(false);

  // The control that was clicked disappears when switching modes; keep focus inside the field.
  useEffect(() => {
    if (!switchedByUser.current) return;
    switchedByUser.current = false;
    const target = state.mode === "cep" ? "#location_cep" : "button";
    container.current?.querySelector<HTMLElement>(target)?.focus();
  }, [state.mode]);

  function switchTo(next: State) {
    switchedByUser.current = true;
    setState(next);
  }

  const announcement =
    state.mode === "locating"
      ? "Buscando sua localização…"
      : state.mode === "gps"
        ? "Localização definida."
        : state.mode === "cep" && state.reason
          ? state.reason
          : "";

  function useGps() {
    // Browsers only give the position on HTTPS (or localhost); e.g. a phone on http://10.0.1.x.
    if (!window.isSecureContext) {
      switchTo({ mode: "cep", reason: "A localização só funciona em conexão segura (HTTPS). Informe o CEP." });
      return;
    }
    if (!("geolocation" in navigator)) {
      switchTo({ mode: "cep", reason: "Seu navegador não informa a localização. Informe o CEP." });
      return;
    }
    switchTo({ mode: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setState({ mode: "gps", lat: coords.latitude, lng: coords.longitude }),
      (error) =>
        switchTo({
          mode: "cep",
          reason:
            error.code === 1
              ? "Permita o acesso à localização ou informe o CEP."
              : "Não conseguimos sua localização. Informe o CEP.",
        }),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    );
  }

  return (
    <fieldset ref={container} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {state.mode === "cep" ? (
        <>
          <input type="hidden" name="location_kind" value="cep" />
          {state.reason && <p className="text-[13px] text-secundario">{state.reason}</p>}
          <Field
            id="location_cep"
            name="location_cep"
            label="CEP"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={CEP_MAX_LENGTH}
            pattern="\d{5}-\d{3}"
            value={cep}
            onChange={(event) => setCep(formatCep(event.target.value))}
            error={error}
          />
          <button type="button" onClick={useGps} className="self-start text-sm font-semibold text-laranja-texto underline">
            Usar minha localização
          </button>
        </>
      ) : (
        <>
          {state.mode === "gps" && (
            <>
              <input type="hidden" name="location_kind" value="gps" />
              <input type="hidden" name="location_lat" value={state.lat} />
              <input type="hidden" name="location_lng" value={state.lng} />
            </>
          )}
          <button
            type="button"
            onClick={useGps}
            aria-describedby={error ? "location-error" : undefined}
            className="flex w-full items-center gap-4 rounded-card border-[1.5px] border-borda bg-superficie p-4 text-left"
          >
            <Icon name={state.mode === "gps" ? "check" : "location"} />
            <span className="flex flex-col">
              <span className="text-base font-bold">
                {state.mode === "locating"
                  ? "Buscando sua localização…"
                  : state.mode === "gps"
                    ? "Localização definida"
                    : "Usar minha localização"}
              </span>
              <span className="text-sm text-secundario">{hint}</span>
            </span>
          </button>
          {/* Always available, even after the GPS position is set (e.g. a wrong fix). */}
          <button
            type="button"
            onClick={() => switchTo({ mode: "cep" })}
            className="self-start text-sm font-semibold text-laranja-texto underline"
          >
            Informar o CEP
          </button>
          {error && <FieldError id="location-error">{error}</FieldError>}
        </>
      )}
    </fieldset>
  );
}
