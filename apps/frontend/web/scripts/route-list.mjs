import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

// Change these to match your next-intl config
const LOCALES = ['en', 'ar'];

const routes = [];

function normalizeSegments(segments) {
  return segments.flatMap((segment) => {
    if (segment.startsWith('(') && segment.endsWith(')')) {
      return [];
    }

    if (segment.startsWith('_')) {
      return [];
    }

    return [segment];
  });
}

function expandLocales(route) {
  if (!route.includes('[locale]')) {
    return [route];
  }

  return LOCALES.map((locale) => route.replace('[locale]', locale));
}

function addPageRoute(segments) {
  const route = '/' + normalizeSegments(segments).join('/');

  for (const r of expandLocales(route === '/' ? '/' : route)) {
    routes.push({
      method: 'GET',
      type: 'Page',
      route: r,
    });
  }
}

function addApiRoutes(filePath, segments) {
  const source = fs.readFileSync(filePath, 'utf8');

  const methods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ].filter((method) => {
    const regex = new RegExp(
      `export\\s+(?:async\\s+)?function\\s+${method}\\b`,
    );

    return regex.test(source);
  });

  const route = '/' + normalizeSegments(segments).join('/');

  for (const expanded of expandLocales(route === '/' ? '/' : route)) {
    if (methods.length === 0) {
      routes.push({
        method: 'UNKNOWN',
        type: 'API',
        route: expanded,
      });
    } else {
      for (const method of methods) {
        routes.push({
          method,
          type: 'API',
          route: expanded,
        });
      }
    }
  }
}

function walk(dir, segments = []) {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  if (entries.some((e) => e.name === 'page.tsx')) {
    addPageRoute(segments);
  }

  const routeFile = entries.find(
    (e) => e.name === 'route.ts' || e.name === 'route.js',
  );

  if (routeFile) {
    addApiRoutes(path.join(dir, routeFile.name), segments);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    walk(path.join(dir, entry.name), [...segments, entry.name]);
  }
}

walk(APP_DIR);

routes.sort((a, b) => {
  if (a.route === b.route) {
    return a.method.localeCompare(b.method);
  }

  return a.route.localeCompare(b.route);
});

const METHOD = 10;
const TYPE = 8;

console.log('\n' + 'METHOD'.padEnd(METHOD) + 'TYPE'.padEnd(TYPE) + 'ROUTE');

console.log('-'.repeat(70));

for (const route of routes) {
  console.log(
    route.method.padEnd(METHOD) + route.type.padEnd(TYPE) + route.route,
  );
}

console.log('\nTotal Routes:', routes.length);
