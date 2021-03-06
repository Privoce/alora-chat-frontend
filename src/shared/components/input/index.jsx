import React from 'react';

import classNames from 'classnames';

import LabelComponent from 'shared/components/label';

function InputComponent({
  placeholder,
  width,
  height,
  margin,
  type,
  id,
  value,
  onChange,
  onFocus,
  onBlur,
  errorMessage,
  hasError,
  name,
  iconComponent,
  autoComplete,
  maxLength,
  defaultButton,
  search,
  clean,
  iconLeft,
  iconRight,
}) {
  const inputStyles = classNames({
    input: true,
    default: defaultButton,
    search,
    clean,
    'input--error': hasError,
  });

  const iconContainerStyles = classNames({
    'input-icon-container': true,
    'icon-left': iconLeft,
    'icon-right': iconRight,
  });

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <input
          id={id}
          className={inputStyles}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          name={name}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />
        <div className={iconContainerStyles}>
          {iconComponent ? iconComponent() : null}
        </div>
      </div>
      {hasError ? (
        <div className="input-label-container">
          <LabelComponent
            text={errorMessage}
            danger
            fontSize={16}
            fontRegular
          />
        </div>
      ) : null}
    </div>
  );
}

export default InputComponent;
