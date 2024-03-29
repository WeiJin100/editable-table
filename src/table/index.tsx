import React, { FC, useState, useRef, useMemo } from 'react';
import { TableProps } from './table';
import Menu from './menu';
import useIndex from './hooks/useIndex';
import './index.less';
import ReactDOM from 'react-dom';

const TableEditor: FC<TableProps> = props => {
  const barsRef = useRef(null);
  const tableRef = useRef(null);
  const editRef = useRef(null); // 编辑区
  const { bordered = true, showDragBar = true, lang, value, id, style } = props;
  const [firstClickLocation, setfirstClickLocation] = useState<number[]>([]);

  const resetSecondLocation = () => setfirstClickLocation([]);

  const {
    visible,
    menuStyle,
    onMenu,
    start,
    end,
    onContentMenu,
    onInput,
    tableCurrentWidth,
    onDragBars,
  } = useIndex({
    ...props,
    tableRef,
    barsRef,
    firstClickLocation,
    resetSecondLocation,
  });

  const tdStyle = useMemo(() => {
    if (style && typeof style === 'object') {
      return style;
    }
    return {};
  }, [style]);

  const onCellClick = () => {
    // 单击清除编辑区域
    const dom = document.querySelector('.table-edit-area')
    if (dom) {
      dom.parentElement.remove()
    }
    editRef.current = null
  };

  const onPaste = (e: any) => {
    // 以纯文本方式粘贴
    e.preventDefault()
    var text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  };

  const renderEditArea = (dom: any) => {
    if (editRef && editRef.current) {
      return;
    }
    const domValue = dom.getBoundingClientRect()
    const div = document.createElement('div')
    dom.appendChild(div)

    const borderWidth = tdStyle.border ? String(tdStyle.border).split(" ")[0] : "1px";
    const offset = `calc(-${borderWidth} / 2)`;

    const ele = (
      <div
        style={{
          minHeight: domValue.height, // minHeight，可实现编辑区域随内容扩展
          width: domValue.width,
          outlineWidth: borderWidth,
          left: offset,
          top: offset,
          // outlineOffset: offset,
        }}
        className="table-edit-area"
        onInput={onInput}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        contentEditable={true}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: dom.innerHTML }}
        ref={editRef}
        onPaste={onPaste}
      >
      </div>
    );
    ReactDOM.render(ele, div)
    if (editRef && editRef.current) {
      setCursorPosition(editRef.current)
    }
  }

  const setCursorPosition = (ele: any) => {
    // Creates range object
    const setpos = document.createRange();

    // Creates object for selection
    const set = window.getSelection();

    // Set start position of range
    setpos.setStart(ele, 1);

    // Collapse range within its boundary points
    // Returns boolean
    setpos.collapse(true);

    // Remove all ranges set
    set.removeAllRanges();

    // Add range with respect to range object.
    set.addRange(setpos);

    // Set cursor on focus
    ele.focus();
  }

  const onDoubleClick = (e: any) => {
    let dom = e.target;

    while (dom.tagName.toLocaleLowerCase() !== 'td') {
      dom = dom.parentElement
    }
    renderEditArea(dom)
  }

  const getContentEditable = (index: number, i: number) => {
    return [index, i].join('') === firstClickLocation.join('') && firstClickLocation.length === 2;
  };

  const borderStyle = tdStyle && tdStyle.border ? tdStyle.border : '1px solid #d9d9d9';

  return (
    <div className="table-box" id={id}>
      {visible && (
        <Menu
          lang={lang}
          cellData={value.children[start.x].children[end.y]}
          start={start}
          end={end}
          onClick={onMenu}
          menuStyle={menuStyle}
          onContentMenu={onContentMenu}
        />
      )}
      <div className="table-wrap" ref={barsRef}>
        {showDragBar && value.rows && value.rows.length > 0 && (
          <div className="table-bar" style={{ width: tableCurrentWidth }}>
            {value.rows.map((t: any, i: any) => (
              <div
                className="bar-item"
                key={`bar-${i}`}
                style={{ width: t || 140 }}
              >
                {value.rows && i < value.rows.length - 1 && (
                  <div
                    className="row-trigger"
                    onMouseDown={(e: any) => onDragBars(e, i)}
                  ></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <table
        className={`table-editor` + (bordered ? " table-bordered" : "")}
        ref={tableRef}
        onContextMenu={onContentMenu}
        style={showDragBar ? { border: borderStyle, ...tdStyle } : { width: "100%", border: borderStyle, ...tdStyle }}
        cellPadding="0"
        cellSpacing="0"
      >
        {showDragBar && value.rows && value.rows.length > 0 && (
          <colgroup>
            {value.rows.map((t: number, i: any) => (
              <col
                span={1}
                key={`colgroup-col-${i}`}
                style={{ width: t || 140 }}
              />
            ))}
          </colgroup>
        )}
        <tbody>
          {value.children.map((row, index) => (
            <tr key={row.id} style={row.style ? row.style : {}}>
              {row.children.map((t, i) => (
                <td
                  key={`${t.id}`}
                  style={{
                    padding: "4px 8px",
                    border: borderStyle,
                    ...t.style,
                    ...(t.props &&
                    (t.props.rowSpan === 0 || t.props.colSpan === 0)
                      ? { display: "none" }
                      : {}),
                  }}
                  {...(t.props
                    ? { colSpan: t.props.colSpan, rowSpan: t.props.rowSpan }
                    : {})}
                  onClick={onCellClick}
                  onDoubleClick={(e: any) => onDoubleClick(e)}
                  className={
                    getContentEditable(index, i) ? "td_bg td-edit" : ""
                  }
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: t.content }}
                  ></div>
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
