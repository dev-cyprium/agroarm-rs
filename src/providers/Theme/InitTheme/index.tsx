import Script from 'next/script'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  (function () {
    try {
      var pref = window.localStorage.getItem('${themeLocalStorageKey}')
      // Default to light unless the visitor explicitly chose dark.
      var theme = pref === 'dark' ? 'dark' : '${defaultTheme}'
      document.documentElement.setAttribute('data-theme', theme)
    } catch (e) {
      document.documentElement.setAttribute('data-theme', '${defaultTheme}')
    }
  })();
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
