import * as esbuild from 'esbuild'
import pkg from './package.json' assert { type: 'json' }

const isProduction = process.env.NODE_ENV === 'production';

await esbuild.build({
  entryPoints: [ pkg.source ],
  bundle: true,
  minify: isProduction,
  outfile: pkg.main,
  sourcemap: !isProduction,
  target: 'es2022',
  format: 'esm',
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
  },
}).catch(() => process.exit(1));
