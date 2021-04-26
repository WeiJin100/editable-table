/// <reference types="react" />

export type language = 'zh' | 'en' | 'zh-hant';

export interface InitTableColumnsProps {
  x: number;
  y: number;
}

// 数据结构
export interface TableRowsProps {
  children: TableColProps[];
  id: string | number;
}

export interface TableColProps {
  content?: string | number | any;
  id: string | number;
  props?: TableCellProps;
}

export interface TableCellProps {
  colSpan?: number;
  rowSpan?: number;
}

interface TableValueProps {
  children: TableRowsProps[];
  rows?: number[];
}

export interface TableProps {
  value: TableValueProps;
  init?: InitTableColumnsProps;
  bordered?: boolean | true;
  defaultCellWidth?: number;
  showDragBar?: boolean;
  lang?: language;
  onChange?: (data: any) => void;
  onFocus?: () => void;
  id?: string;
  style?: React.CSSProperties;
}

// declare function Table<RecordType extends object = any>(props: TableProps<RecordType>): JSX.Element;

// export default Table;
