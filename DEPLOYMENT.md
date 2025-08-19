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
nslookup editessolutions.com
dig editessolutions.com
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

3. **Configure firewall** (commands used during deployment):
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw --force enable
   ```

### Step 3: Deploy Website Files

1. **Upload files** using SCP from Windows (actual commands used):
   ```powershell
   # From PowerShell in C:\Repos\edites-solutions-landing-main\
   scp -i C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem index.html ubuntu@44.204.243.42:/tmp/
   scp -i C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem -r images ubuntu@44.204.243.42:/tmp/
   ```

   **Key file location**: `C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem`
   **Local files**: `C:\Repos\edites-solutions-landing-main\`

2. **Move files to web directory** (actual commands used):
   ```bash
   # SSH into the Lightsail instance first:
   ssh -i C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem ubuntu@44.204.243.42
   
   # Then move files (commands executed during deployment):
   sudo cp /tmp/index.html /var/www/html/
   sudo cp -r /tmp/images /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

3. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/edites-solution
   ```

   **Actual Nginx configuration used during deployment**:
   ```nginx
   server {
       listen 80;
       listen [::]:80;

       server_name editessolutions.com www.editessolutions.com;

       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       # Gzip
       gzip on;
       gzip_types text/css application/javascript text/javascript application/json;

       # Cache de estáticos
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable the site** (actual commands used during deployment):
   ```bash
   sudo ln -s /etc/nginx/sites-available/edites-solution /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```
   
   **Note**: The commands were executed in this exact order during deployment.

### Step 4: Create Static IP

1. **In Lightsail Console**:
   - Go to "Networking" tab
   - Click "Create static IP"
   - Attach to your instance
   - **Your static IP**: `44.204.243.42`

---

## 🔗 Part 3: Connect Domain to Lightsail

### Step 1: Create DNS Records in Route 53

1. **Go to Route 53 Console**
2. **Select your hosted zone**
3. **Create Record Sets**:

   **A Record for root domain**:
   - Name: (leave blank)
   - Type: A
   - Value: `44.204.243.42`
   - TTL: 300

   **A Record for www subdomain**:
   - Name: www
   - Type: A  
   - Value: `44.204.243.42`
   - TTL: 300

### Step 2: Test Domain Access

```bash
# Wait 5-10 minutes then test
curl -I http://editessolutions.com
curl -I http://www.editessolutions.com

# Should resolve to 44.204.243.42
nslookup editessolutions.com
nslookup www.editessolutions.com
```

### Step 3: Verify External Access

During deployment, external IP `98.85.143.82` was used to test domain access.
This confirms the website is accessible from outside the Lightsail network.

---

## 🔒 Part 4: SSL Certificate (HTTPS)

### Step 1: Install Certbot (actual commands used during deployment)

```bash
# Commands executed on Lightsail instance
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Step 2: Get SSL Certificate (actual command used)

```bash
# Command executed during deployment
sudo certbot --nginx -d editessolutions.com -d www.editessolutions.com
```

**Additional step taken during deployment**:
```bash
# Nginx was restarted after SSL configuration
sudo systemctl restart nginx
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
- Parameter NotificationEmail: `mauro@editessolutions.com`
- Parameter FromEmail: `noreply@editessolutions.com`
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
   - Email: `noreply@editessolutions.com`
   - Click "Create identity"
4. **Check email and verify**

---

## 📁 Part 6: Upload Website Files from Windows

### Your File Locations
- **Local files**: `C:\Repos\edites-solutions-landing-main\`
- **SSH Key**: `C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem`
- **Lightsail IP**: `44.204.243.42`

### Upload Commands (PowerShell)

```powershell
# Navigate to your project directory
cd "C:\Repos\edites-solutions-landing-main"

# Upload index.html
scp -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" index.html ubuntu@44.204.243.42:/tmp/

# Upload images folder
scp -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" -r images ubuntu@44.204.243.42:/tmp/
```

### Move Files on Server

```bash
# SSH into the server
ssh -i "C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem" ubuntu@44.204.243.42

# Move files to web directory
sudo cp /tmp/index.html /var/www/html/
sudo cp -r /tmp/images /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

---

## 🔧 Part 7: Configure Frontend for Production

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
<meta property="og:url" content="https://editessolutions.com/">
<meta property="twitter:url" content="https://editessolutions.com/">
<link rel="canonical" href="https://editessolutions.com/">
```

And structured data:

```javascript
// Around line 47
"url": "https://editessolutions.com",
"logo": "https://editessolutions.com/images/PNG/logo.png",
"image": "https://editessolutions.com/images/PNG/header.png",
```

### Step 3: Restart Nginx

```bash
sudo systemctl reload nginx
```

---

## 🧪 Part 7: Testing Everything

### Website Access
- ✅ `http://editessolutions.com` (should redirect to HTTPS)
- ✅ `https://editessolutions.com` (should work)
- ✅ `https://www.editessolutions.com` (should work)

### Contact Form
1. **Fill out contact form** on your website
2. **Submit and check for success message**
3. **Check your email** for the notification

### Performance Tests
```bash
# Test from command line
curl -I https://editessolutions.com
curl -w "@-" -o /dev/null -s https://editessolutions.com <<< "
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
- Use `dig editessolutions.com` to test

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

---

## 📊 Deployment Summary - Real Data Used

### **Infrastructure Details**
- **Domain**: editessolutions.com
- **Lightsail IP**: 44.204.243.42
- **SSH Key**: LightsailDefaultKey-us-east-1.pem
- **External Test IP**: 98.85.143.82 (used for verification)

### **File Locations (Windows)**
- **Project Files**: `C:\Repos\edites-solutions-landing-main\`
- **SSH Key**: `C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem`
- **Main Files**: `index.html`, `images/` folder

### **Server Configuration**
- **Nginx Config**: `/etc/nginx/sites-available/edites-solution`
- **Web Root**: `/var/www/html/`
- **SSL**: Let's Encrypt via Certbot
- **Cache**: Static assets cached for 1 year

### **Email Configuration**
- **Notifications**: `mauro@editessolutions.com`
- **Sender**: `noreply@editessolutions.com`
- **Region**: us-east-1

### **Commands Used During Actual Deployment**
```bash
# Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# File Upload (Windows PowerShell)
scp -i C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem index.html ubuntu@44.204.243.42:/tmp/
scp -i C:/Users/Mauro/.ssh/LightsailDefaultKey-us-east-1.pem -r images ubuntu@44.204.243.42:/tmp/

# File Movement
sudo cp /tmp/index.html /var/www/html/
sudo cp -r /tmp/images /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Nginx Setup
sudo nano /etc/nginx/sites-available/edites-solution
sudo ln -s /etc/nginx/sites-available/edites-solution /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d editessolutions.com -d www.editessolutions.com
sudo systemctl restart nginx
```

**This documentation now reflects the exact process and commands used during the successful deployment of editessolutions.com.**