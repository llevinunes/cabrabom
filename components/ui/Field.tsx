const boxClasses =
  "w-full rounded-campo border-[1.5px] border-borda bg-superficie px-4 py-[15px] text-base text-obra " +
  "placeholder:text-secundario focus:border-obra focus:outline-none";

type FieldProps = {
  label: string;
  id: string;
  error?: string;
} & (
  | ({ multiline?: false } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ multiline: true } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
);

export function Field(props: FieldProps) {
  const { label, id, error } = props;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {props.multiline ? (
        <textarea
          {...withoutFieldProps(props)}
          id={id}
          rows={props.rows ?? 2}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`${boxClasses} resize-none`}
        />
      ) : (
        <input
          {...withoutFieldProps(props)}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={boxClasses}
        />
      )}
      {error && <FieldError id={errorId!}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-[13px] font-medium text-laranja-texto">
      {children}
    </p>
  );
}

function withoutFieldProps<T extends { label: string; error?: string; multiline?: boolean }>(props: T) {
  const { label: _label, error: _error, multiline: _multiline, ...rest } = props;
  return rest;
}
