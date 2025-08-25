/// <reference types="@welldone-software/why-did-you-render" />

import React from 'react';

if (process.env.NODE_ENV === 'development') {
  try {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: false, // Disable automatic tracking to avoid conflicts
      trackHooks: false, // Disable hook tracking to avoid conflicts
      logOwnerReasons: true,
      collapseGroups: true,
      exclude: [
        /^Chevron/, // Exclude all chevron icons
        /^Icon$/, // Exclude icon components
        /lucide-react/, // Exclude lucide-react components
        /^Check$/, // Exclude check icons
        /^Circle$/, // Exclude circle icons
        /^MoreHorizontal$/, // Exclude more horizontal icons
        /^createElement$/, // Exclude createElement calls
      ],
    });
  } catch (error) {
    console.warn('why-did-you-render failed to initialize:', error);
  }
}
