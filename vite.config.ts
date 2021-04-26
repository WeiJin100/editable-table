import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'rc-editable-table'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'juqery'],
      output: {
        globals: {
          react: 'React',
          "react-dom": 'ReactDom',
          juqery: '$'
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
})
