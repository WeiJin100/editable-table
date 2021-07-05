import React, { useEffect, useMemo, useState } from 'react';
import $ from 'jquery';
import { getDomOffsetLeft, getDomOffsetTop, uuid } from '../../utils/common';
import { TableProps, TableRowsProps } from '../table';

let mouse_begin = { x: 0, y: 0 };
let mouse_end = { x: 0, y: 0 };
let times = Date.now();

interface UseIndexProps extends TableProps {
  tableRef: React.MutableRefObject<null>;
  barsRef: React.MutableRefObject<null>;
  firstClickLocation: number[];
  resetSecondLocation?: () => void;
}

const useIndex = (props: UseIndexProps) => {
  const {
    tableRef,
    firstClickLocation,
    resetSecondLocation,
    barsRef,
    showDragBar = true,
    value,
    onFocus,
    onChange,
    id,
    onEdit
  } = props;
  const [menuStyle, setMenuStyle] = useState({ left: 0, top: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    $(document).on('click', function(e: any) {
      var _con = $('.table-box');
      if (!_con.is(e.target) && _con.has(e.target).length === 0) {
        onClear();
      }
    });
  }, []);

  useEffect(() => {
    if (value && value.children.length > 0) {
      onMouseDown();
      mouseUp();
      setCellInnerText();
    }
  }, [value]);

  const getUUID = () => uuid(16, 16);

  const tableCurrentWidth = useMemo(() => {
    return value && value.rows && value.rows.length > 0 ? value.rows.reduce((a, b) => a + b) : 0;
  }, [value]);

  // 根据content内容设置单元格innerText
  const setCellInnerText = () => {
    const dom: any = tableRef.current;

    if (dom) {
      // const tbody = dom.children[showDragBar ? 1 : 0];
      const tbody: any = [...dom.children].filter((v: { nodeName: string; }) => v.nodeName === 'TBODY')[0]

      for (let i = 0; i < value.children.length; i++) {
        for (let j = 0; j < value.children[i].children.length; j++) {
          // 当前单元格处于编辑模式时取消赋值
          if (!getContentEditable(i, j)) {
            const target = tbody.children[i].children[j].children[0];
            if (target) {
              target.innerHTML = value.children[i].children[j].content;
            }
            // tbody.children[i].children[j].children[0].innerHTML = value.children[i].children[j].content;
          }
        }
      }
    }
  };

  // 单元格是否可编辑
  const getContentEditable = (index: number, i: number) => {
    return [index, i].join('') === firstClickLocation.join('') && firstClickLocation.length === 2;
  };

  const onMouseDown = () => {
    $(`#${id} .table-editor td`).on('mousedown', function(e) {
      onFocus && onFocus();
      e.stopPropagation(); //阻止继承父元素document的mousedown事件
      if (e.button === 2) {
        // secondClickLocation = []; // 右键时重置二次点击
        resetSecondLocation && resetSecondLocation();
        setMenuStyle({
          left: getDomOffsetLeft(this) + this.offsetWidth / 2,
          top: getDomOffsetTop(this) + this.offsetHeight / 2,
        });
        setVisible(true);
        return;
      } else {
        setVisible(false);
      }
      const local = {
        x: $(this)
          .parent()
          .parent()
          .find('tr')
          .index($(this).parent()[0]),
        y: $(this)
          .parent()
          .find('td')
          .index($(this)[0]),
      };
      mouse_begin = local;
      mouse_end = local;
      $(`#${id} .table-editor td`).removeClass('td_bg'); //清空所有选中
      $(this).addClass('td_bg');
      mouseMove();
    });
  };

  const mouseMove = () => {
    $(`#${id} .table-editor td`).on('mouseover', function(e) {
      e.stopPropagation();
      $(`#${id} .table-editor td`).removeClass('td_bg'); //清空所有选中
      const local = {
        x: $(this)
          .parent()
          .parent()
          .find('tr')
          .index($(this).parent()[0]),
        y: $(this)
          .parent()
          .find('td')
          .index($(this)[0]),
      };

      mouse_end = local;

      const maxX = mouse_begin.x < mouse_end.x ? mouse_end.x : mouse_begin.x;
      const minX = mouse_begin.x < mouse_end.x ? mouse_begin.x : mouse_end.x;
      const maxY = mouse_begin.y < mouse_end.y ? mouse_end.y : mouse_begin.y;
      const minY = mouse_begin.y < mouse_end.y ? mouse_begin.y : mouse_end.y;
      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          $(this)
            .parent()
            .parent()
            .find('tr:eq(' + i + ') td:eq(' + j + ')')
            .addClass('td_bg');
        }
      }
    });
  };

  const mouseUp = () => {
    $(`#${id} .table-editor td`).on('mouseup', function(e) {
      e.stopPropagation();
      $(`#${id} .table-editor td`).off('mouseover');
    });
  };

  const onClear = () => {
    $(`#${id} .table-editor td`).removeClass('td_bg'); //点击表格之外的部分，清空所有选中
    $(`#${id} .table-editor td`).off('mouseover');
    setVisible(false);
    // 清除编辑区域
    const dom = document.querySelector('.table-edit-area')
    if (dom) {
      dom.parentElement.remove()
    }
  };

  const onMenu = (type: string) => {
    switch (type) {
      case 'editRow':
        onEditType(type)
        break;
      case 'editCell':
        onEditType(type)
        break;
      case 'merge':
        onMerge();
        break;
      case 'split':
        onSplit();
        break;
      case 'delRow':
        onDelRow();
        break;
      case 'delCol':
        onDelCol();
        break;
      default:
        onInsert(type);
        break;
    }
    onClear();
  };

  // 编辑行、编辑单元格
  const onEditType = (type: string) => {
    const rowIndex = mouse_begin.x
    const cellIndex = mouse_end.y

    onEdit && onEdit(type, [rowIndex, cellIndex]);
  };

  const onMerge = () => {
    /*
     * 合并单元格的基本原则是在所选择单元格的最前面一项上对rolspan或colspan进行累加，其余项设置为0
     * 在dom中对rolspan或colspan为0的项进行display: none处理
     * 暂时未实现的功能：将单元格内的内容进行累加
     */
    let start = mouse_begin;
    let end = mouse_end;
    if (mouse_begin.x > mouse_end.x || mouse_begin.y > mouse_end.y) {
      start = mouse_end;
      end = mouse_begin;
    }
    const colNum = Math.abs(end.y - start.y);
    const rowNum = Math.abs(end.x - start.x);

    const temp = JSON.parse(JSON.stringify([...value.children]));
    if (rowNum === 0) {
      // 单元格在同一行内的合并
      for (let i = 0; i <= colNum; i++) {
        if (i === 0) {
          const mergeStr = mergeCellContent(start, end);
          temp[start.x].children[start.y] = {
            ...temp[start.x].children[start.y],
            content: mergeStr,
            props: {
              rowSpan: rowNum + (temp[start.x].children[start.y]?.props?.rowSpan || 1),
              colSpan: colNum + (temp[start.x].children[start.y]?.props?.colSpan || 1),
            },
          };
          const dom: any = tableRef.current;
          if (dom) {
            const tbody = dom.children[showDragBar ? 1 : 0];

            tbody.children[start.x].children[start.y].children[0].innerHTML = mergeStr;
          }
        } else {
          temp[start.x].children[end.y] = {
            ...temp[start.x].children[end.y],
            props: {
              colSpan: 0,
            },
          };
        }
      }
    } else {
      // 单元格跨不同行合并
      for (let i = 0; i <= rowNum; i++) {
        for (let j = start.y; j <= end.y; j++) {
          if (i === 0 && j === start.y) {
            const mergeStr = mergeCellContent(start, end);
            temp[start.x].children[start.y] = {
              ...temp[start.x].children[start.y],
              content: mergeStr,
              props: {
                rowSpan: rowNum + (temp[start.x].children[start.y]?.props?.rowSpan || 1),
                colSpan: colNum + (temp[start.x].children[start.y]?.props?.colSpan || 1),
              },
            };
            // 通过innerText修改单元格内容
            const dom: any = tableRef.current;
            if (dom) {
              const tbody = dom.children[showDragBar ? 1 : 0];

              tbody.children[start.x].children[start.y].children[0].innerHTML = mergeStr;
            }
          } else {
            temp[start.x + i].children[j] = {
              ...temp[start.x + i].children[j],
              props: {
                rowSpan: 0,
              },
            };
          }
        }
      }
    }
    updateTableData(temp, value.rows || []);
  };

  const updateTableData = (tableData: TableRowsProps[], tableRows: number[]) => {
    onChange &&
      onChange({
        children: tableData,
        rows: tableRows,
      });
  };

  // 合并单元格内容
  const mergeCellContent = (start: any, end: any) => {
    // 1, 1; 2, 2
    let str: string = '';
    for (let i = start.x; i <= end.x; i++) {
      for (let j = start.y; j <= end.y; j++) {
        str += value.children[i].children[j].content;
      }
    }
    return str;
  };

  const onSplit = () => {
    const temp = JSON.parse(JSON.stringify([...value.children]));
    const tdProps: any = temp[mouse_begin.x].children[mouse_begin.y].props;
    for (let i = 0; i < tdProps.rowSpan; i++) {
      for (let j = 0; j < tdProps.colSpan; j++) {
        temp[mouse_begin.x + i].children[mouse_begin.y + j] = {
          ...temp[mouse_begin.x + i].children[mouse_begin.y + j],
          props: {
            colSpan: 1,
            rowSpan: 1,
          },
        };
      }
    }

    updateTableData(temp, value.rows || []);
  };

  const onInsert = (type: string) => {
    /*
     * 要考虑到已合并的单元格
     * 如果是已合并单元格，则取其 colSpan 、rowSpan，进行坐标相加减计算，以确定最终插入位置
     */
    const temp = JSON.parse(JSON.stringify([...value.children]));
    let row = 0;
    let col = 0;
    switch (type) {
      case 'left':
        col = Math.min(mouse_end.y, mouse_begin.y);
        break;
      case 'right':
        col = Math.max(mouse_end.y, mouse_begin.y) + 1;
        break;
      case 'top':
        row = Math.min(mouse_end.x, mouse_begin.x);
        break;
      case 'bottom':
        row = Math.max(mouse_end.x, mouse_begin.x) + 1;

        const target = mouse_end.x >= mouse_begin.x ? mouse_end : mouse_begin;
        const rowSapn = value.children[target.x].children[target.y].props?.rowSpan;
        if (rowSapn && rowSapn > 1) {
          row += rowSapn - 1;
        }
        break;
      default:
        break;
    }
    if (type === 'left' || type === 'right') {
      for (let i = 0; i < temp.length; i++) {
        temp[i].children.splice(col, 0, {
          content: '',
          id: getUUID(),
        });
      }
      const result: any[] = JSON.parse(JSON.stringify(value.rows || []));
      if (showDragBar) {
        result.splice(col, 0, 140);

        // 修改table的总width值
        const domCol: any = tableRef.current;
        const width = result.reduce((a, b) => a + b);
        if (domCol !== null) {
          domCol.style.width = width + 'px';
        }
      }
      updateTableData(temp, result);
    } else {
      const arr: any = [];
      for (let i = 0; i < temp[0].children.length; i++) {
        arr.push({ content: '', id: getUUID() });
      }
      temp.splice(row, 0, {
        id: getUUID(),
        children: arr,
      });
      updateTableData(temp, value.rows || []);
    }
  };

  const onDelCol = () => {
    const num = Math.abs(mouse_end.y - mouse_begin.y) + 1;
    const startIndex = Math.min(mouse_begin.y, mouse_end.y);
    const temp: any[] = JSON.parse(JSON.stringify([...value.children]));
    // 修改table
    const result: any[] = JSON.parse(JSON.stringify(value.rows || []));
    if (showDragBar) {
      result.splice(startIndex, num);
      const width = result.reduce((a, b) => a + b);
      const domCol: any = tableRef.current;
      if (domCol !== null) {
        domCol.style.width = width + 'px';
      }
    }
    temp.forEach(item => {
      item.children.splice(Math.min(mouse_begin.y, mouse_end.y), num);
    });
    updateTableData(temp, result);
  };

  const onDelRow = () => {
    const num = Math.abs(mouse_end.x - mouse_begin.x) + 1;
    const temp = JSON.parse(JSON.stringify([...value.children]));
    temp.splice(Math.min(mouse_end.x, mouse_begin.x), num);
    updateTableData(temp, value.rows || []);
  };

  const onInput = (e: any) => {
    const v = e.target.innerHTML;
    // const text = v.replaceAll("\n\n\n", "\n\n").replaceAll("\n", "<br />")
    // const text = v.replaceAll("\n", "<br />")
    const temp = JSON.parse(JSON.stringify([...value.children]));
    temp[mouse_begin.x].children[mouse_begin.y].content = v;
    // setContent(temp);
    updateTableData(temp, value.rows || []);
  };

  const onContentMenu = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragBars = (e: any, index: number) => {
    const result: any[] = JSON.parse(JSON.stringify(value.rows || []));
    let clientStartX = e.clientX;
    e.preventDefault();
    e.stopPropagation();
    // onFocus && onFocus();

    $(`#${id} .table-bar`).on('mousemove', event => {
      if (times && Date.now() - times < 16) {
        return;
      }
      times = Date.now();
      const computedX = event.clientX - clientStartX;
      const currentWidth = Number(Number(result[index]) + computedX);
      result[index] = currentWidth;

      // setRows(result);
      updateTableData(value.children, result);

      changeDomStyle(index, currentWidth, result);
      clientStartX = event.clientX;
    });
  };

  const changeDomStyle = (index: number, value: number, values: number[]) => {
    const width = values.reduce((a, b) => a + b);

    const dom: any = barsRef.current;
    const domCol: any = tableRef.current;
    if (dom !== null) {
      dom.children[0].children[index].style.width = value + 'px';
      dom.children[0].style.width = width + 'px';
    }
    if (domCol !== null) {
      domCol.children[0].children[index].style.width = value + 'px';
      domCol.style.width = width + 'px';
    }
  };

  return {
    menuStyle,
    visible,
    onMenu,
    start: mouse_begin,
    end: mouse_end,
    // content,
    onContentMenu,
    getContentEditable,
    onInput,
    // rows,
    tableCurrentWidth,
    onDragBars,
    onClear,
  };
};

export default useIndex;
