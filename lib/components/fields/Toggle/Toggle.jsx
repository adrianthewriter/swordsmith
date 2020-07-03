import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'

import styles from './Toggle.css'

const Toggle = ({ id, label, type, value, multiple, checked, ...props }) => {
  if (props.hidden) {
    return (
      <input
        type="hidden"
        name={`attr_${id}-toggle`}
        value={value ? value : checked ? 'hidden' : '0'}
        className={c(styles.toggle, props.className) || null}
      />
    )
  } else {
    return (
      <label className={c(styles.toggle, type && styles[type]) || null}>
        {multiple && (
          <input
            type="radio"
            name={`attr_${id}-toggle`}
            value="clear"
            checked={checked}
          />
        )}
        <input
          type={multiple ? 'radio' : 'checkbox'}
          name={`attr_${id}-toggle`}
          value={value ? value : 'hidden'}
          checked={checked}
        />
        <span>{label}</span>
      </label>
    )
  }
}

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
}

Toggle.defaultProps = {
  label: false,
  type: null,
  value: false,
  checked: false,
  hidden: false,
  multiple: false,
  className: null,
}

export default Toggle
