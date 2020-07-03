import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'

import { Field, Button } from '@components'
import styles from './FieldGroup.css'

const InnerField = ({ groupId, index, id, label, roll, ...props }) => {
  id = id ? id : `${groupId}-${index + 1}`

  return (
    <label
      title={props.tooltip ? props.tooltip : null}
      className={
        c(
          styles.field,
          props.start && styles.start,
          props.end && styles.end,
          props.className
        ) || null
      }
    >
      <Field id={id} {...props} />
      {roll ? (
        <Button id={id} roll={roll}>
          {label}
        </Button>
      ) : (
        <span>{label}</span>
      )}
    </label>
  )
}

const FieldGroup = ({ id: groupId, label: groupLabel, ...groupProps }) => {
  const FieldSet = () => {
    return React.Children.map(groupProps.children, (child, index) => {
      return <InnerField groupId={groupId} index={index} {...child.props} />
    })
  }

  return (
    <div
      title={groupProps.tooltip ? groupProps.tooltip : null}
      className={c(styles.fieldgroup, groupProps.className) || null}
    >
      {groupLabel && <h3>{groupLabel}</h3>}
      <div>
        <FieldSet />
      </div>
    </div>
  )
}

FieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'textbox', 'metabox']),
}

FieldGroup.defaultProps = {
  type: 'text',
  value: '',
  label: false,
  tooltip: false,
  placeholder: null,
  className: null,

  hidden: false,
  displayOnly: false,
}

export default FieldGroup
