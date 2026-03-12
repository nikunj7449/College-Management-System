const { getWelcomeEmailTemplate } = require('./src/utils/emailTemplates');
const fs = require('fs');

const html = getWelcomeEmailTemplate(
  'John Doe',
  'Student',
  'john.doe@college.edu',
  '01/01/2000',
  'https://yourportal.com/login'
);

fs.writeFileSync('preview.html', html);
console.log('preview.html generated!');