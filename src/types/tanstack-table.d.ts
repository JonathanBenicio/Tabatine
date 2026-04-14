import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<_TData, _TValue> { // eslint-disable-line @typescript-eslint/no-unused-vars
    align?: 'left' | 'center' | 'right';
    hiddenOnMobile?: boolean;
  }
}
