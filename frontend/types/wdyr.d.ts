declare module '@welldone-software/why-did-you-render' {
  import React from 'react';
  
  interface WhyDidYouRenderOptions {
    trackAllPureComponents?: boolean;
    trackHooks?: boolean;
    logOwnerReasons?: boolean;
    collapseGroups?: boolean;
    include?: RegExp[];
    exclude?: RegExp[];
    logOnDifferentValues?: boolean;
    hotReloadBufferMs?: number;
    onlyLogs?: boolean;
    titleColor?: string;
    diffNameColor?: string;
    diffPathColor?: string;
    notifier?: (options: any) => void;
  }

  function whyDidYouRender(React: typeof React, options?: WhyDidYouRenderOptions): void;
  
  export = whyDidYouRender;
}
