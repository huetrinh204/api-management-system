interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Indigo', value: '#6366F1' },
];

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '6px',
              border: value === color.value ? '3px solid var(--accent)' : '2px solid var(--border)',
              backgroundColor: color.value,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          />
        ))}
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: '0.8125rem', marginBottom: '4px' }}>
          Custom HEX Color (optional)
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="#3B82F6"
          value={value || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val && /^#[0-9A-Fa-f]{6}$/.test(val)) {
              onChange(val);
            }
          }}
          maxLength={7}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
        />
        <span className="form-hint">Format: #RRGGBB (e.g., #3B82F6)</span>
      </div>
    </div>
  );
}
