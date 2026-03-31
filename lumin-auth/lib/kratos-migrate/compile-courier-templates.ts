import { promises as fs } from 'fs';
import path from 'path';

import { EmailVerification } from '../mjml/email-verification';
import { PasswordRecovery } from '../mjml/password-recovery';

async function main() {
  const html = await PasswordRecovery({
    recoveryUrl: '{{ .RecoveryURL }}'
  });

  const templatePath = path.normalize('kratos/courier-templates/recovery/valid/email.body.gotmpl');
  await fs.writeFile(templatePath, html);

  writeTemplatePipeline(PasswordRecovery({ recoveryUrl: '{{ .RecoveryURL }}' }), 'recovery/valid/email.body.gotmpl');
  writeTemplatePipeline(EmailVerification({ verificationUrl: '{{ .VerificationURL }}' }), 'verification/valid/email.body.gotmpl');
}

async function writeTemplatePipeline(template: Promise<string>, filepath: string) {
  const html = await template;

  const basePath = 'kratos/courier-templates';
  const templatePath = path.normalize(path.join(basePath, filepath));
  await fs.writeFile(templatePath, html);
}

main();
