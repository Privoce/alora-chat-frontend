import React from 'react';

import classNames from 'classnames';

import LabelComponent from 'shared/components/label';

function TagComponent({ success, text }) {
  const tagStyles = classNames({
    tag: true,
    fadeIn: true,
    success,
  });

  return (
    <div className={tagStyles}>
      <LabelComponent
        text={text}
        fontSemiBold
        alignCenter
        defaultLabel
        fontSize={12}
        breakWord
        width={18}
      />
    </div>
  );
}

export default TagComponent;
