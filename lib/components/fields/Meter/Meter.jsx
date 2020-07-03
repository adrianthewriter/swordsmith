import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'

import styles from './Meter.css'

const Meter = ({ id, size, noClear, set, maximum, ...props }) => {
  if (set && Array.isArray(set)) {
    set = set
  } else {
    set = Array.from(Array(parseInt(size)), (e, i) => ({
      value: i + 1,
      label: i + 1,
    }))
    !noClear && set.unshift({ value: 0, label: 'x', clear: true })
  }

  return (
    <div className={c(styles.meter, props.className) || null}>
      {maximum && (
        <input type="hidden" name={`attr_${id}_max`} value={maximum} />
      )}

      {set &&
        set.map((item, index) => (
          <>
            <input
              type="radio"
              name={`attr_${id}`}
              value={item.value ? item.value : null}
              checked={index === 0 ? 'checked' : null}
            />
            <span className={c(item.clear && styles.clear) || null}>
              {item.label && item.label}
            </span>
          </>
        ))}
    </div>
  )
}

Meter.propTypes = {
  id: PropTypes.string.isRequired,
}

Meter.defaultProps = {
  set: false,
  maximum: false,
  className: null,
}

export default Meter
