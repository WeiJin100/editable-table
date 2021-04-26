import React, { FC, useState, useRef, useMemo } from 'react';
import { TableProps } from './table';
import Menu from './menu';
import useIndex from './hooks/useIndex';
import './index.less';
import ReactDOM from 'react-dom';

const TableEditor: FC<TableProps> = props => {
  const barsRef = useRef(null);
  const tableRef = useRef(null);
  const { bordered = true, showDragBar = true, lang, value, id, style } = props;
  const [firstClickLocation, setfirstClickLocation] = useState<number[]>([]);

  const resetSecondLocation = () => setfirstClickLocation([]);

  const {
    visible,
    menuStyle,
    onMenu,
    start,
    end,
    // content,
    onContentMenu,
    onInput,
    // rows,
    tableCurrentWidth,
    onDragBars,
  } = useIndex({
    ...props,
    tableRef,
    barsRef,
    firstClickLocation,
    resetSecondLocation,
  });

  const onCellClick = () => {
    // 单击清楚编辑区域
    const dom = document.querySelector('.table-editable')
    if (dom) {
      ReactDOM.unmountComponentAtNode(dom)
    }
  };

  const onDoubleClick = (e: any) => {
    const domValue = e.target.getBoundingClientRect()

    const ele = (
      <div
        style={{
          minHeight: domValue.height + 1, // minHeight，可实现编辑区域随内容扩展
          width: domValue.width + 1,
          left: domValue.left,
          top: domValue.top,
        }}
        className="table-edit-area"
        onInput={onInput}
        contentEditable={true}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: e.target.innerHTML }}
      >
      </div>
    );
    ReactDOM.render(ele, document.querySelector('.table-editable'))
  }

  const getContentEditable = (index: number, i: number) => {
    return [index, i].join('') === firstClickLocation.join('') && firstClickLocation.length === 2;
  };

  const tdStyle = useMemo(() => {
    if (style && typeof style === 'object') {
      return style;
    }
    return {};
  }, [style]);

  return (
    <div className="table-box" id={id}>
      <div className="table-editable"></div>
      {visible && (
        <Menu
          lang={lang}
          cellData={value.children[start.x].children[end.y]}
          start={start}
          end={end}
          onClick={onMenu}
          menuStyle={menuStyle}
        />
      )}
      <div className="table-wrap" ref={barsRef}>
        {showDragBar && value.rows && value.rows.length > 0 && (
          <div className="table-bar" style={{ width: tableCurrentWidth }}>
            {value.rows.map((t: any, i: any) => (
              <div className="bar-item" key={`bar-${i}`} style={{ width: t || 140 }}>
                {value.rows && i < value.rows.length - 1 && (
                  <div className="row-trigger" onMouseDown={(e: any) => onDragBars(e, i)}></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <table
        className={`table-editor` + (bordered ? ' table-bordered' : '')}
        ref={tableRef}
        onContextMenu={onContentMenu}
        style={showDragBar ? {} : { width: '100%' }}
        cellPadding="0"
        cellSpacing="0"
      >
        {showDragBar && value.rows && value.rows.length > 0 && (
          <colgroup>
            {value.rows.map((t: number, i: any) => (
              <col span={1} key={`colgroup-col-${i}`} style={{ width: t || 140 }} />
            ))}
          </colgroup>
        )}
        <tbody>
          {value.children.map((row, index) => (
            <tr key={row.id}>
              {row.children.map((t, i) => (
                <td
                  key={`${t.id}`}
                  style={{
                    padding: '4px 8px',
                    ...tdStyle,
                    ...(t.props && (t.props.rowSpan === 0 || t.props.colSpan === 0) ? { display: 'none' } : {}),
                  }}
                  {...(t.props ? { colSpan: t.props.colSpan, rowSpan: t.props.rowSpan } : {})}
                  onClick={onCellClick}
                  onDoubleClick={(e: any) => onDoubleClick(e)}
                  className={getContentEditable(index, i) ? 'td_bg td-edit' : ''}
                  dangerouslySetInnerHTML={{ __html: t.content }}
                >
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableEditor;
