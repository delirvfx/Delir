/// <reference types="react" />
import { ComponentContext } from '@ragg/fleur';
import * as React from 'react';
export interface ContextProp {
    context: ComponentContext;
}
declare const withComponentContext: <Props extends ContextProp>(Component: React.ComponentClass<Props>) => {
    new (props: Pick<Props, Exclude<keyof Props, "context">>, context?: any): {
        render(): React.ComponentElement<Readonly<{
            children?: React.ReactNode;
        }> & Readonly<{
            children: (context: ComponentContext) => React.ReactNode;
        }>, React.Component<{
            children: (context: ComponentContext) => React.ReactNode;
        }, React.ComponentState, never>>;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Pick<Props, Exclude<keyof Props, "context">>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<Pick<Props, Exclude<keyof Props, "context">>>;
        state: Readonly<{}>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export { withComponentContext as default };
