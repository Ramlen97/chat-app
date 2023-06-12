const Sib = require('sib-api-v3-sdk');

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const resetpasswordEmail = (user, id) => {
    const sender = {
        email: process.env.EMAIL,
        name: 'Chat App'
    }
    const receivers = [{
        email: user.email
    }]

    return tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Reset password',
        htmlContent: `
        <h4>Hello {{params.name}},</h4>
        <p>Please click on the below link to reset your password. This link will expire in 1 hour.</p>
        <a href="http://${process.env.IP}:2000/password/resetpassword/${id}">Reset your password</a>`,
        params: {
            name: user.username
        }
    });
}

module.exports = {
    resetpasswordEmail
}