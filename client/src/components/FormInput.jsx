import React from 'react';

const FormInput = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helper,
  disabled = false,
  rows = 4,
  options = [], // For select input
  className = '',
}) => {
  const inputId = id || name;

  const baseInputClasses = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition duration-150 ease-in-out focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        >
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
};

export default FormInput;
