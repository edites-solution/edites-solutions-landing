#!/bin/bash

# Complete deployment script for editessolutions.com
# This script provides step-by-step instructions for deploying the website

echo "🚀 Edites Solutions Complete Deployment Guide"
echo "=============================================="
echo ""
echo "Domain: editessolutions.com"
echo "This script will guide you through the complete deployment process."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites Check${NC}"
echo "Before continuing, ensure you have:"
echo "  ✓ AWS Account with billing enabled"
echo "  ✓ Domain editessolutions.com (owned by you)"
echo "  ✓ AWS CLI installed and configured"
echo "  ✓ SAM CLI installed"
echo ""

read -p "Do you have all prerequisites? (y/N): " prereq
if [[ ! $prereq =~ ^[Yy]$ ]]; then
    echo "Please complete prerequisites first. See DEPLOYMENT.md for details."
    exit 1
fi

echo ""
echo -e "${YELLOW}🌐 Step 1: Route 53 Domain Setup${NC}"
echo "1. Go to Route 53 Console: https://console.aws.amazon.com/route53/"
echo "2. Create hosted zone for: editessolutions.com"
echo "3. Note the 4 nameservers provided"
echo "4. Update your domain registrar with these nameservers"
echo ""
read -p "Have you completed Route 53 setup? (y/N): " route53
if [[ ! $route53 =~ ^[Yy]$ ]]; then
    echo "Please complete Route 53 setup first."
    exit 1
fi

echo ""
echo -e "${YELLOW}🖥️ Step 2: Lightsail Instance Setup${NC}"
echo "1. Go to Lightsail Console: https://lightsail.aws.amazon.com/"
echo "2. Create instance: Ubuntu 20.04 LTS, $3.50/month plan"
echo "3. Name: edites-website"
echo "4. Create static IP and attach to instance"
echo ""
read -p "Have you created the Lightsail instance? (y/N): " lightsail
if [[ ! $lightsail =~ ^[Yy]$ ]]; then
    echo "Please create Lightsail instance first."
    exit 1
fi

echo ""
echo -e "${YELLOW}⚡ Step 3: Deploy Lambda Contact Form${NC}"
echo "Deploying Lambda function..."
echo ""

cd lambda/contact-form

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Lambda files not found. Make sure you're in the project root.${NC}"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building SAM application..."
sam build

echo ""
echo "Deploying to AWS..."
echo "Use these parameters when prompted:"
echo "  Stack name: edites-contact-form"
echo "  AWS Region: us-east-1 (or your preferred)"
echo "  NotificationEmail: mauro@editessolutions.com"
echo "  FromEmail: noreply@editessolutions.com"
echo ""

sam deploy --guided

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lambda deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Important: Copy the API Gateway URL from the output above.${NC}"
    echo "You'll need it for the frontend configuration."
    echo ""
    read -p "Press Enter to continue..."
else
    echo -e "${RED}❌ Lambda deployment failed. Check the error messages above.${NC}"
    exit 1
fi

cd ../..

echo ""
echo -e "${YELLOW}📧 Step 4: Verify Email in SES${NC}"
echo "1. Go to SES Console: https://console.aws.amazon.com/ses/"
echo "2. Navigate to 'Verified identities'"
echo "3. Create identity for: noreply@editessolutions.com"
echo "4. Check email and click verification link"
echo ""
read -p "Have you verified the email in SES? (y/N): " ses
if [[ ! $ses =~ ^[Yy]$ ]]; then
    echo "Please verify email in SES before continuing."
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Step 5: Update Frontend Configuration${NC}"
echo "Now you need to update the website configuration:"
echo ""
echo "1. Edit index.html and update these lines (around line 1599):"
echo "   CONTACT_API_URL: 'https://YOUR-API-GATEWAY-URL/Prod/contact'"
echo "   USE_SIMULATION: false"
echo ""
echo "2. The API Gateway URL was shown in the Lambda deployment output above"
echo ""
read -p "Have you updated the frontend configuration? (y/N): " frontend
if [[ ! $frontend =~ ^[Yy]$ ]]; then
    echo "Please update frontend configuration."
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload website files to your Lightsail instance"
echo "2. Configure Nginx (see DEPLOYMENT.md for details)"
echo "3. Set up SSL certificate with Certbot"
echo "4. Create DNS A records in Route 53"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
echo -e "${BLUE}📊 Your website will be available at:${NC}"
echo "  🌍 https://editessolutions.com"
echo "  🌍 https://www.editessolutions.com"
echo ""
echo -e "${BLUE}💰 Monthly costs:${NC}"
echo "  • Lightsail: $3.50"
echo "  • Route 53: $0.50"
echo "  • Lambda/SES: ~$0.00"
echo "  • Total: ~$4.00/month"
echo ""
echo -e "${GREEN}Welcome to your new professional website! 🚀${NC}"