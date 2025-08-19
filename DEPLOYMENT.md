# 🚀 Complete Deployment Guide - Edites Solutions

This guide covers deploying the complete Edites Solutions website using AWS services: Lightsail for hosting, Route 53 for domain management, and Lambda for the contact form.

## 📋 Prerequisites

- AWS Account with billing enabled
- Domain name (you own)
- AWS CLI installed and configured
- SAM CLI installed (for Lambda deployment)

## 🏗️ Architecture Overview

```
Internet → Route 53 → Lightsail (Static Website) → API Gateway → Lambda → SES
```

- **Route 53**: DNS management for your domain
- **Lightsail**: Static website hosting (simple and cost-effective)
- **API Gateway + Lambda**: Contact form backend
- **SES**: Email delivery service

---

## 🌐 Part 1: Domain Setup with Route 53

### Step 1: Create Hosted Zone

1. **Go to Route 53 Console**: https://console.aws.amazon.com/route53/
2. **Create Hosted Zone**:
   - Click "Create hosted zone"
   - Enter your domain name (e.g., `edites-solution.com`)
   - Type: Public hosted zone
   - Click "Create hosted zone"

3. **Note the Name Servers**:
   - Copy the 4 NS records from your hosted zone
   - Example: 
     ```
     ns-1234.awsdns-12.org
     ns-5678.awsdns-34.net
     ns-9012.awsdns-56.co.uk
     ns-3456.awsdns-78.com
     ```

### Step 2: Update Domain Registrar

1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Update nameservers** to the 4 AWS nameservers from Step 1
3. **Wait for propagation** (can take 24-48 hours)

### Step 3: Verify DNS Setup

```bash
# Check if DNS is working (after propagation)
nslookup your-domain.com
dig your-domain.com
```

---

## 🖥️ Part 2: Website Hosting with Lightsail

### Step 1: Create Lightsail Instance

1. **Go to Lightsail Console**: https://lightsail.aws.amazon.com/
2. **Create Instance**:
   - Platform: Linux/Unix
   - Blueprint: OS Only → Ubuntu 20.04 LTS
   - Instance plan: $3.50/month (512 MB RAM, 1 vCPU, 20 GB SSD)
   - Instance name: `edites-website`
   - Click "Create instance"

### Step 2: Configure Web Server

1. **Connect to instance** via SSH (browser-based terminal)

2. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

3. **Configure firewall**:
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw --force enable
   ```

### Step 3: Deploy Website Files

1. **Upload files** using Lightsail file manager or SCP:
   ```bash
   # From your local machine
   scp -i /path/to/lightsail-key.pem index.html ubuntu@YOUR-INSTANCE-IP:/tmp/
   scp -r -i /path/to/lightsail-key.pem images ubuntu@YOUR-INSTANCE-IP:/tmp/
   ```

2. **Move files to web directory**:
   ```bash
   # On the Lightsail instance
   sudo cp /tmp/index.html /var/www/html/
   sudo cp -r /tmp/images /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

3. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/edites-solution
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       listen [::]:80;
       
       server_name your-domain.com www.your-domain.com;
       
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/css application/javascript text/javascript application/json;
       
       # Cache static assets
       location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/edites-solution /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Step 4: Create Static IP

1. **In Lightsail Console**:
   - Go to "Networking" tab
   - Click "Create static IP"
   - Attach to your instance
   - Note the static IP address

---

## 🔗 Part 3: Connect Domain to Lightsail

### Step 1: Create DNS Records in Route 53

1. **Go to Route 53 Console**
2. **Select your hosted zone**
3. **Create Record Sets**:

   **A Record for root domain**:
   - Name: (leave blank)
   - Type: A
   - Value: Your Lightsail static IP
   - TTL: 300

   **A Record for www subdomain**:
   - Name: www
   - Type: A  
   - Value: Your Lightsail static IP
   - TTL: 300

### Step 2: Test Domain Access

```bash
# Wait 5-10 minutes then test
curl -I http://your-domain.com
curl -I http://www.your-domain.com
```

---

## 🔒 Part 4: SSL Certificate (HTTPS)

### Step 1: Install Certbot

```bash
# On Lightsail instance
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Step 2: Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose redirect option (recommended)

### Step 3: Auto-renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status snap.certbot.renew.timer
```

---

## ⚡ Part 5: Deploy Lambda Contact Form

### Step 1: Deploy Lambda Function

```bash
# In your project directory
cd lambda/contact-form
npm install
sam build
sam deploy --guided
```

**Guided deployment parameters**:
- Stack name: `edites-contact-form`
- AWS Region: `us-east-1` (or your preferred)
- Parameter NotificationEmail: `your-email@domain.com`
- Parameter FromEmail: `noreply@your-domain.com`
- Confirm changes: Y
- Allow SAM to create IAM roles: Y
- Save parameters to config file: Y

### Step 2: Note API Gateway URL

Copy the API Gateway URL from deployment output:
```
https://abc123def4.execute-api.us-east-1.amazonaws.com/Prod/contact
```

### Step 3: Verify Email in SES

1. **Go to SES Console**: https://console.aws.amazon.com/ses/
2. **Navigate to "Verified identities"**
3. **Create identity**:
   - Identity type: Email address
   - Email: `noreply@your-domain.com`
   - Click "Create identity"
4. **Check email and verify**

---

## 🔧 Part 6: Configure Frontend for Production

### Step 1: Update Contact Form Configuration

Edit `index.html` on your Lightsail instance:

```bash
sudo nano /var/www/html/index.html
```

Find and update these lines (around line 1598-1601):

```javascript
const CONFIG = {
    // Replace with your actual API Gateway URL
    CONTACT_API_URL: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod/contact',
    // Set to false for production
    USE_SIMULATION: false
};
```

### Step 2: Update SEO Meta Tags

Update the meta tags with your actual domain:

```html
<!-- Around lines 14-30 -->
<meta property="og:url" content="https://your-domain.com/">
<meta property="twitter:url" content="https://your-domain.com/">
<link rel="canonical" href="https://your-domain.com/">
```

And structured data:

```javascript
// Around line 47
"url": "https://your-domain.com",
"logo": "https://your-domain.com/images/PNG/logo.png",
"image": "https://your-domain.com/images/PNG/header.png",
```

### Step 3: Restart Nginx

```bash
sudo systemctl reload nginx
```

---

## 🧪 Part 7: Testing Everything

### Website Access
- ✅ `http://your-domain.com` (should redirect to HTTPS)
- ✅ `https://your-domain.com` (should work)
- ✅ `https://www.your-domain.com` (should work)

### Contact Form
1. **Fill out contact form** on your website
2. **Submit and check for success message**
3. **Check your email** for the notification

### Performance Tests
```bash
# Test from command line
curl -I https://your-domain.com
curl -w "@-" -o /dev/null -s https://your-domain.com <<< "
     namelookup:  %{time_namelookup}s
        connect:  %{time_connect}s
     appconnect:  %{time_appconnect}s
    pretransfer:  %{time_pretransfer}s
       redirect:  %{time_redirect}s
  starttransfer:  %{time_starttransfer}s
          total:  %{time_total}s
"
```

---

## 💰 Cost Breakdown

### Monthly Costs (USD)
- **Lightsail Instance**: $3.50/month (512MB)
- **Route 53 Hosted Zone**: $0.50/month
- **Lambda**: ~$0.00 (first 1M requests free)
- **API Gateway**: ~$0.00 (first 1M requests free)
- **SES**: $0.10 per 1,000 emails

**Total: ~$4.00/month** for a professional website with contact form

---

## 🔄 Part 8: Ongoing Maintenance

### Regular Updates

1. **Update website content**:
   ```bash
   # Upload new files to Lightsail
   scp -i lightsail-key.pem updated-index.html ubuntu@YOUR-IP:/tmp/
   sudo cp /tmp/updated-index.html /var/www/html/index.html
   ```

2. **Update Lambda function**:
   ```bash
   cd lambda/contact-form
   # Make changes to index.js
   sam build && sam deploy
   ```

### Monitoring

1. **Check website uptime**: Use services like UptimeRobot
2. **Monitor Lambda logs**:
   ```bash
   sam logs -n ContactFormFunction --stack-name edites-contact-form --tail
   ```
3. **Check SSL certificate expiry**: Certbot handles auto-renewal

### Backups

1. **Create Lightsail snapshot**:
   - Go to Lightsail Console
   - Select your instance
   - Click "Snapshots" tab
   - Create manual snapshot

2. **Version control**:
   ```bash
   # Keep your code in Git
   git add .
   git commit -m "Production deployment"
   git push
   ```

---

## 🆘 Troubleshooting

### Common Issues

**DNS not resolving**:
- Check nameservers at registrar
- Wait for DNS propagation (up to 48 hours)
- Use `dig your-domain.com` to test

**SSL certificate issues**:
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

**Contact form not working**:
- Check browser console for errors
- Verify API Gateway URL in `CONFIG.CONTACT_API_URL`
- Check Lambda logs for errors
- Ensure SES email is verified

**Website not loading**:
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Support Resources
- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)

---

## 🎉 Congratulations!

Your Edites Solutions website is now fully deployed with:
- ✅ Professional domain setup
- ✅ HTTPS security
- ✅ Fast static hosting
- ✅ Functional contact form
- ✅ Email notifications
- ✅ SEO optimization
- ✅ Cost-effective infrastructure

Your website is ready for business! 🚀