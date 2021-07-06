import React, { FC, useMemo } from 'react';
import {
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  InsertRowBelowOutlined,
  InsertRowAboveOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  DeleteColumnOutlined,
  DeleteRowOutlined,
  EditOutlined,
  FormOutlined
} from '@ant-design/icons';
import { TableColProps, InitTableColumnsProps, language } from './table';
import zh from './i18n/zh';
import en from './i18n/en';
import zhHant from './i18n/zh-Hant';
import useI18n from './hooks/useI18n';

interface MenuProps {
  onClick: (type: string) => void;
  cellData: TableColProps;
  start: InitTableColumnsProps;
  end: InitTableColumnsProps;
  menuStyle?: React.CSSProperties;
  lang?: language;
  onContentMenu?: (e: any) => void;
}

const Menu: FC<MenuProps> = props => {
  const { onClick, cellData, start, end, menuStyle, lang = 'zh', onContentMenu } = props;

  let result;
  if (lang === 'zh') {
    result = zh;
  } else if (lang === 'zh-hant') {
    result = zhHant;
  } else {
    result = en;
  }
  const { p } = useI18n(result, lang);

  const showSplitCell = useMemo(() => {
    const props = cellData.props;
    if (props) {
      return (props.rowSpan || 0) > 1 || (props.colSpan || 0) > 1;
    }
    return false;
  }, [cellData]);

  const onMenu = (e: any, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(type);
  };

  return (
    <div className="menu" style={{ ...menuStyle }} onContextMenu={onContentMenu}>
      {/* 只能编辑单行，不支持跨行 */}
      {false && end.x === start.x && (
        <div className="menu-item" onClick={(e: any) => onMenu(e, 'editRow')}>
          <EditOutlined />
          {p('editRow')}
        </div>
      )}
      {/* 只能编辑单个单元格，不支持多选 */}
      {false && (end.x === start.x && end.y === start.y) && (
        <div className="menu-item" onClick={(e: any) => onMenu(e, 'editCell')}>
          <FormOutlined />
          {p('editCell')}
        </div>
      )}
      {end.x === start.x && (
        <div className="divider" />
      )}
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'left')}>
        <InsertRowLeftOutlined />
        {p('insertLeft')}
      </div>
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'right')}>
        <InsertRowRightOutlined />
        {p('insertRight')}
      </div>
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'top')}>
        <InsertRowAboveOutlined />
        {p('insertTop')}
      </div>
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'bottom')}>
        <InsertRowBelowOutlined />
        {p('insertBottom')}
      </div>
      {/* <div className="divider" /> */}
      {(end.x !== start.x || end.y !== start.y) && (
        <div className="menu-item" onClick={(e: any) => onMenu(e, 'merge')}>
          <MergeCellsOutlined />
          {p('mergeCell')}
        </div>
      )}
      {showSplitCell && (
        <div className="menu-item" onClick={(e: any) => onMenu(e, 'split')}>
          <SplitCellsOutlined />
          {p('splitCell')}
        </div>
      )}
      <div className="divider" />
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'delCol')}>
        <DeleteColumnOutlined />
        {p('delCol')}
      </div>
      <div className="menu-item" onClick={(e: any) => onMenu(e, 'delRow')}>
        <DeleteRowOutlined />
        {p('delRow')}
      </div>
    </div>
  );
};

export default Menu;
