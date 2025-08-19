# Edites Solutions Contact Form Lambda

This directory contains the AWS Lambda function that handles contact form submissions for the Edites Solutions website.

## 🚀 Quick Setup

### Prerequisites
- AWS CLI installed and configured
- AWS SAM CLI installed
- Node.js 18+ installed

### Installation

1. **Install AWS CLI**: 
   ```bash
   # macOS
   brew install awscli
   
   # Or download from: https://aws.amazon.com/cli/
   ```

2. **Install SAM CLI**:
   ```bash
   # macOS
   brew install aws-sam-cli
   
   # Or download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

### 🛠️ Deployment

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

2. **Follow the guided deployment**:
   - Enter stack name: `edites-contact-form`
   - Enter AWS Region: `us-east-1` (or your preferred region)
   - Enter notification email: `your-email@domain.com`
   - Enter from email: `noreply@yourdomain.com` (must be verified in SES)
   - Confirm the rest of the defaults

3. **Note the API Gateway URL** from the deployment output

4. **Update the frontend**:
   - Copy the API Gateway URL from the deployment output
   - Update `CONFIG.CONTACT_API_URL` in `index.html`
   - Set `CONFIG.USE_SIMULATION` to `false` in `index.html`

### 📧 Email Setup

**Important**: You must verify your sender email address in AWS SES:

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities"
3. Click "Create identity"
4. Add your sender email address (the one you specified in `FROM_EMAIL`)
5. Check your email and click the verification link

### 🔧 Configuration

Edit these environment variables in `template.yaml`:
- `NOTIFICATION_EMAIL`: Where form submissions are sent
- `FROM_EMAIL`: Sender email address (must be verified in SES)

### 📝 Frontend Integration

The contact form will automatically use the Lambda function when:
1. `CONFIG.CONTACT_API_URL` is set to your API Gateway URL
2. `CONFIG.USE_SIMULATION` is set to `false`

### 🧪 Testing

Test the contact form locally with simulation:
1. Keep `CONFIG.USE_SIMULATION = true`
2. Open `index.html` in a browser
3. Fill out and submit the contact form
4. Check browser console for payload data

Test with real Lambda:
1. Deploy the Lambda function
2. Set `CONFIG.USE_SIMULATION = false`
3. Update `CONFIG.CONTACT_API_URL` with your endpoint
4. Test the form submission

### 🔄 Updates

To update just the Lambda function code:
```bash
cd lambda/contact-form
sam build && sam deploy
```

### 💰 Costs

This setup is very cost-effective:
- **Lambda**: ~$0.0000002 per request
- **API Gateway**: ~$0.0000035 per request  
- **SES**: $0.10 per 1,000 emails
- **Total**: Essentially free for typical contact form usage

### 🔒 Security

- CORS is configured for your domain
- Input validation and sanitization included
- Rate limiting available through API Gateway
- No sensitive data stored in logs

### 🐛 Troubleshooting

**Common issues:**

1. **Email not sending**: Verify sender email in SES
2. **CORS errors**: Check API Gateway CORS configuration
3. **Permission errors**: Ensure Lambda has SES permissions
4. **Deployment fails**: Check AWS credentials and permissions

**Check logs**:
```bash
sam logs -n ContactFormFunction --stack-name edites-contact-form --tail
```