/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import * as gulp from 'gulp';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as babel from 'gulp-babel';
import { registerComponent } from 'mjml-core';
import * as Handlebars from 'handlebars';
// eslint-disable-next-line import/extensions
import helpers from './src/Email/mjml/helpers/Handlebars';
import { CommonConstants } from './src/Common/constants/CommonConstants';

const mjml2html = require('mjml');

process.stdout.write(chalk.green.bold('Register mjml components\n'));

helpers.register();

const mjmlPath = path.join(process.cwd(), 'src/Email/mjml');
const layoutsPath = path.join(mjmlPath, 'layouts');
const libsPath = path.join(mjmlPath, 'libs');
const templatesPath = path.join(mjmlPath, 'templates');
const componentsPath = path.join(mjmlPath, 'components');
const includesPath = path.join(mjmlPath, 'includes');
const htmlPath = path.join(mjmlPath, 'html');
const watchedHtmlPath = path.join(mjmlPath, 'watchedHtml');

const registerMjmlComponents = () => {
  const files = fs.readdirSync(libsPath);
  files.forEach((file) => {
    const fullPath = path.join(libsPath, file);
    delete require.cache[fullPath];
    registerComponent(require(fullPath).default);
  });
};

const gulpMjmlTask = (func) => () => gulp
  .src([path.join(layoutsPath, '*.js'), path.join(componentsPath, '*.js')])
  .pipe(
    babel({
      presets: ['@babel/preset-env'],
    }),
  )
  .on('error', console.error)
  .pipe(gulp.dest(libsPath))
  .on('end', () => {
    func();
  });

const writeHtmlFile = (file, data, destPath) => {
  const htmlFileName = file.slice(0, file.lastIndexOf('.'));
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }
  fs.writeFileSync(
    path.join(destPath, `${htmlFileName}.html`),
    data,
  );
};

const buildMjml = () => {
  registerMjmlComponents();
  const files = fs.readdirSync(templatesPath);
  files.forEach((file) => {
    fs.readFile(path.join(templatesPath, file), 'utf8', (error, data) => {
      if (error) throw error;
      mjml2html(data).then(({ html }) => {
        writeHtmlFile(file, html, htmlPath);
      });
    });
  });
};

const watchMjml = () => {
  registerMjmlComponents();
  const files = fs.readdirSync(templatesPath);
  files.forEach((file) => {
    fs.readFile(path.join(templatesPath, file), 'utf8', (error, data) => {
      if (error) throw error;
      const htmlData = mjml2html(data);
      const template = Handlebars.compile(htmlData.html);
      const result = template({
        assetUrl: CommonConstants.LUMIN_ASSETS_URL,
        baseUrl: 'https://app.luminpdf.com',
        luminSignUrl: 'https://sign.luminpdf.com',
        verifyLink: 'https://app.luminpdf.com/verification/email',
        token: '834745987d987g97g987sdf98h7f6h98988sad7g987ad987ad9',
        name: 'Hieu Do',
        staticUrl: 'https://luminpdf.com',
        documentName: 'The basic Kubernetes',
        documentId: '48957275236526',
        commenterName: 'Hieu dep trai',
        orgName: 'DSV',
        saleUrl: 'luminpdf.com',
        sharerName: 'Hien',
        searchParam: 'kkkkkkkaaa',
        actor: 'Hien',
        domain: 'DSV',
        totalMembers: '50',
        dateEnd: 'May 11, 2019',
        comments: [
          {
            comment: '@hieudm With the long long long long xx2 long long long long long xx2 long long long long long xx2 long long comment',
            userName: '@hieudm With the long long long long xx2 long long long long ',
            time: new Date(),
          },
        ],
        updateEnterprise: true,
        oldPlan: 'Monthly',
        oldSize: '30',
        newPlan: 'Monthly',
        newSize: '50',
        isOneDayRemaining: true,
        numberDaysUsePremium: 70,
      });

      writeHtmlFile(file, result, watchedHtmlPath);
    });
  });
};

// Gulp tasks
if (process.env.NODE_ENV === 'development') {
  gulp.task('watch', () => gulp.watch([layoutsPath, templatesPath, componentsPath, includesPath], gulpMjmlTask(watchMjml)));
}

gulp.task('build', gulpMjmlTask(buildMjml));
