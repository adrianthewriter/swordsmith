import React from 'react'
import PropTypes from 'prop-types'
import c from 'classnames'

import { Toggle } from '@components'
import styles from './Drawer.css'

const Drawer = ({ id, ...props }) => {
  return (
    <>
      <Toggle hidden id={id} />
      <div className={c(styles.drawer, props.className) || null}>
        {props.children}
      </div>
    </>
  )
}

Drawer.propTypes = {
  id: PropTypes.string.isRequired,
}

export default Drawer
