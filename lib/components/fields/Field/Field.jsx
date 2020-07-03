import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'

import styles from './Field.css'

const HiddenField = ({ id, value, ...props }) => (
  <input
    type="hidden"
    name={`attr_${id}`}
    value={value}
    className={c(styles.field, props.className) || null}
  />
)

const StaticField = ({ id, value, ...props }) => (
  <span
    name={`attr_${id}`}
    className={c(styles.field, props.className) || null}
  >
    {value}
  </span>
)

const TextField = ({ id, value, placeholder, ...props }) => (
  <input
    type="text"
    name={`attr_${id}`}
    value={value}
    placeholder={placeholder}
    className={c(styles.field, props.className) || null}
  />
)

const TextBox = ({ id, value, placeholder, ...props }) => (
  <textarea
    name={`attr_${id}`}
    value={value}
    placeholder={placeholder}
    className={c(styles.field, props.className) || null}
  />
)

const MetaBox = ({ id, value, placeholder, ...props }) => (
  <label
    title={props.tooltip ? props.tooltip : null}
    className={c(styles.meta, props.className) || null}
  >
    <textarea name={`attr_${id}`} placeholder={placeholder} value="value" />
  </label>
)

const InnerField = ({ hidden, displayOnly, type, ...props }) => {
  if (hidden) {
    return <HiddenField {...props} />
  } else if (displayOnly) {
    return <StaticField {...props} />
  } else if (type === 'text') {
    return <TextField {...props} />
  } else if (type === 'textbox') {
    return <TextBox {...props} />
  } else if (type === 'metabox') {
    return <MetaBox {...props} />
  }
}

const Field = ({ id, label, ...props }) => {
  if (label) {
    return (
      <label
        title={props.tooltip ? props.tooltip : null}
        className={c(styles.field, props.className) || null}
      >
        <span>{label}</span>
        <InnerField id={id} {...props} />
      </label>
    )
  } else {
    return (
      <InnerField
        id={id}
        className={c(styles.field, props.className) || null}
        {...props}
      />
    )
  }
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'textbox', 'metabox']),
}

Field.defaultProps = {
  type: 'text',
  value: '',
  label: false,
  tooltip: false,
  placeholder: null,
  className: null,

  hidden: false,
  displayOnly: false,
}

export default Field
