#!/bin/bash

# Deployment script for Edites Solutions Contact Form Lambda
# Make sure you have AWS CLI and SAM CLI installed

echo "🚀 Deploying Edites Solutions Contact Form Lambda..."

# Navigate to the Lambda function directory
cd lambda/contact-form

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build and deploy with SAM
echo "🏗️  Building SAM application..."
sam build

echo "🚀 Deploying to AWS..."
sam deploy --guided

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Note the API Gateway URL from the output above"
echo "2. Update the frontend form to use this URL"
echo "3. Verify your FROM_EMAIL address in AWS SES console"
echo "4. Test the contact form"
echo ""
echo "💡 To update just the function code later, run:"
echo "   sam build && sam deploy"