import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Table from './src/index';
// import Table from './dist/rc-editable-table.es'
// import './dist/style.css'

const value = {
  children: [
    {
      id: '1231q31aqq',
      children: [
        { id: 'asdawqwe', content: '1' },
        { id: 'asdawqasawe', content: '2qwe' },
        { id: 'asdawzxcqwe', content: '3' },
      ],
    },
    {
      id: '1231qhjffg31aqq',
      children: [
        { id: 'asdawqsdhwe', content: '1<br/>2<br/>3' },
        { id: 'asdawdfqasawe', content: '', props: { rowSpan: 1, colSpan: 2 } },
        { id: 'asdawzxccvbqwe', content: '', props: { colSpan: 0 } },
      ],
    },
    {
      id: '1231q31asdljjqq',
      children: [
        { id: 'asdawqwcvbe', content: '' },
        { id: 'asdawq45nbasawe', content: '' },
        { id: 'asdawz0987xcqwe', content: '' },
      ],
    },
  ],
  rows: [200, 200, 200],
};

const Index = () => {
  const [v1, setV1] = React.useState({ ...value });
  const [v2, setV2] = React.useState({ ...value });
  const [v3, setV3] = React.useState({ ...value });
  const onChange = (data: any) => {
    console.log(data);
  };

  const onFocus = () => {
    console.log('focus');
  };
  return (
    <div style={{ width: 600 }}>
      <Table
        onFocus={onFocus}
        value={v1}
        showDragBar={false}
        lang="zh"
        onChange={(v: any) => {
          console.log(v);
          setV1(v);
        }}
        id="t1"
        style={{
          border: '1px solid red',
          fontSize: '14px',
          height: '50px',
          marginBottom: 20
        }}
      />
      <Table
        onFocus={onFocus}
        value={v2}
        showDragBar={true}
        lang="zh"
        style={{ fontSize: '20px', marginBottom: 20 }}
        onChange={(v: any) => {
          console.log(v);
          setV2(v);
        }}
        id="t2"
      />
      <Table
        onFocus={onFocus}
        value={v3}
        showDragBar={true}
        lang="zh"
        onChange={(v: any) => {
          console.log(3);
          setV3(v);
        }}
        id="t3"
      />
    </div>
  );
};

const App = () => {
  return (
    <div style={{ width: 600, margin: '0 auto', overflowX: 'auto' }} onClick={() => console.log(123)}>
      <Index />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
