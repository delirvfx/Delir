/// <reference types="react" />
import * as React from 'react';
import { ComponentContext } from '@ragg/fleur';
declare const ComponentContextProvider: {
    Provider: React.ComponentClass<{
        value: ComponentContext;
    }>;
    Consumer: React.ComponentClass<{
        children: (context: ComponentContext) => React.ReactNode;
    }>;
};
export { ComponentContextProvider as default };
