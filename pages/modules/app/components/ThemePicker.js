import React, { useState } from 'react'
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react'
import { Helmet } from 'react-helmet'
import ColorPalette32 from '@carbon/icons-react/lib/color-palette/32'

const themes = {
  Mitie: 'pel--theme',
  g10: 'carbon--theme--g10',
  g90: 'carbon--theme--g90',
  g100: 'carbon--theme--g100',
  white: 'carbon--theme--white',
  v9: 'carbon--theme--v9'
}

export const ThemePicker = () => {
  const [theme, setTheme] = useState('pel--theme')

  const onChange = thm => () => {
    setTheme(thm)
  }

  return (
    <>
      <OverflowMenu renderIcon={ColorPalette32} flipped className="bx--header__action">
        {Object.entries(themes).map(([key, value]) => {
          return (
            <OverflowMenuItem
              key={key}
              itemText={key}
              selectorPrimaryFocus={theme === value}
              onClick={onChange(value)}
            />
          )
        })}
      </OverflowMenu>
      <Helmet>
        <html className={theme} lang="en" />
      </Helmet>
    </>
  )
}
