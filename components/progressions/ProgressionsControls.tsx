import type { NoteName, Tonality } from "@/lib/music";

type StyleOption = "Pop" | "Rock" | "Blues" | "Jazz" | "Ballad";

type LengthOption = 4 | 8;

type SelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type ProgressionsControlsProps = {
  root: NoteName;
  tonality: Tonality;
  style: StyleOption;
  length: LengthOption;
  roots: NoteName[];
  styles: SelectOption<StyleOption>[];
  lengths: SelectOption<LengthOption>[];
  onRootChange: (value: NoteName) => void;
  onTonalityChange: (value: Tonality) => void;
  onStyleChange: (value: StyleOption) => void;
  onLengthChange: (value: LengthOption) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
};

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-zinc-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProgressionsControls({
  root,
  tonality,
  style,
  length,
  roots,
  styles,
  lengths,
  onRootChange,
  onTonalityChange,
  onStyleChange,
  onLengthChange,
  onGenerate,
  onRegenerate,
  canRegenerate,
}: ProgressionsControlsProps) {
  const tonalityOptions: SelectOption<Tonality>[] = [
    { label: "Major", value: "Major" },
    { label: "Minor", value: "Minor" },
  ];

  const rootOptions = roots.map((note) => ({ label: note, value: note }));

  return (
    <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <SelectField label="Root key" value={root} options={rootOptions} onChange={onRootChange} />
      <SelectField
        label="Tonality"
        value={tonality}
        options={tonalityOptions}
        onChange={onTonalityChange}
      />
      <SelectField label="Style / Genre" value={style} options={styles} onChange={onStyleChange} />
      <SelectField
        label="Length"
        value={length}
        options={lengths}
        onChange={(value) => onLengthChange(Number(value) as LengthOption)}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white"
        >
          Generate progression
        </button>
        {canRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:border-zinc-500"
          >
            Regenerate
          </button>
        ) : null}
      </div>
    </div>
  );
}
