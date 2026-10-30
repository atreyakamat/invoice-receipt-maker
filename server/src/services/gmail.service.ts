/** Builds a Gmail compose URL that opens a draft in the user's current Gmail session. */
export const buildGmailComposeUrl = (opts: { to: string; subject: string; body: string }) => {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: opts.to,
    su: opts.subject,
    body: opts.body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
};
