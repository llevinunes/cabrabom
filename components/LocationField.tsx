"use client";

import { useState } from "react";
import { Field, FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

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
}: {
  label: string;
  hint?: string;
  error?: string;
  defaultCep?: string;
}) {
  const [state, setState] = useState<State>(defaultCep ? { mode: "cep" } : { mode: "idle" });

  function useGps() {
    if (!("geolocation" in navigator)) {
      setState({ mode: "cep", reason: "Seu navegador não informa a localização. Informe o CEP." });
      return;
    }
    setState({ mode: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setState({ mode: "gps", lat: coords.latitude, lng: coords.longitude }),
      () => setState({ mode: "cep", reason: "Não conseguimos sua localização. Informe o CEP." }),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>

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
            defaultValue={defaultCep}
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
          {state.mode !== "gps" && (
            <button
              type="button"
              onClick={() => setState({ mode: "cep" })}
              className="self-start text-sm font-semibold text-laranja-texto underline"
            >
              Informar o CEP
            </button>
          )}
          {error && <FieldError id="location-error">{error}</FieldError>}
        </>
      )}
    </fieldset>
  );
}
