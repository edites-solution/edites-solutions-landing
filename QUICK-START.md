# 🚀 Quick Start - editessolutions.com

Your complete step-by-step guide to get editessolutions.com live!

## 📋 Current Status
- ✅ **Domain**: editessolutions.com (owned)
- ✅ **Lightsail Instance**: Running at `44.204.243.42`
- ✅ **Website Files**: `C:\Repos\edites-solutions-landing-main\`
- ✅ **Lambda Function**: Ready to deploy
- ✅ **Email**: `mauro@editessolutions.com`

---

## 🎯 Step-by-Step Deployment

### Step 1: Deploy Lambda Contact Form (5 minutes)
```bash
# From this project directory
./deploy-editessolutions.sh
```
**Result**: Contact form backend deployed, API Gateway URL provided

### Step 2: Create DNS Records (2 minutes)
1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Select `editessolutions.com` hosted zone
3. Create A records:
   - `editessolutions.com` → `44.204.243.42`
   - `www.editessolutions.com` → `44.204.243.42`

**See**: `DNS-SETUP.md` for detailed steps

### Step 3: Upload Website Files (10 minutes)
**From Windows**: Upload files from `C:\Repos\edites-solutions-landing-main\`

**Easiest method**: Lightsail browser file manager
1. Go to [Lightsail Console](https://lightsail.aws.amazon.com/)
2. Connect to `edites-website` instance
3. Use file manager to upload `index.html` and `images/` folder

**See**: `WINDOWS-UPLOAD.md` for all upload methods

### Step 4: Configure Web Server (5 minutes)
```bash
# SSH into Lightsail instance
sudo cp /tmp/index.html /var/www/html/
sudo cp -r /tmp/images /var/www/html/
sudo chown -R www-data:www-data /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/editessolutions
# Add configuration from WINDOWS-UPLOAD.md

# Enable site
sudo ln -s /etc/nginx/sites-available/editessolutions /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

### Step 5: Set Up SSL Certificate (3 minutes)
```bash
# Install Certbot (if needed)
sudo snap install --classic certbot

# Get SSL certificate
sudo certbot --nginx -d editessolutions.com -d www.editessolutions.com
```

### Step 6: Configure Contact Form (2 minutes)
```bash
# Edit the uploaded index.html
sudo nano /var/www/html/index.html

# Update around line 1599:
CONTACT_API_URL: 'https://YOUR-API-GATEWAY-URL/Prod/contact'
USE_SIMULATION: false
```

### Step 7: Verify SES Email (2 minutes)
1. Go to [SES Console](https://console.aws.amazon.com/ses/)
2. Verify `noreply@editessolutions.com`
3. Check email and click verification link

---

## ✅ Testing Checklist

### DNS Tests (after 5-10 minutes)
```bash
nslookup editessolutions.com
nslookup www.editessolutions.com
```
**Expected**: Both return `44.204.243.42`

### Website Tests
- [ ] `https://editessolutions.com` loads
- [ ] `https://www.editessolutions.com` loads
- [ ] SSL certificate is valid (green lock)
- [ ] All images load correctly
- [ ] Language toggle works (EN/ES)

### Contact Form Tests
- [ ] Form submits without errors
- [ ] Success message appears
- [ ] Email arrives at `mauro@editessolutions.com`

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `QUICK-START.md` | This overview guide |
| `DEPLOYMENT.md` | Complete detailed guide |
| `DNS-SETUP.md` | DNS configuration with your IP |
| `WINDOWS-UPLOAD.md` | File upload from Windows |
| `lambda/README.md` | Lambda-specific instructions |

---

## 💰 Monthly Costs
- **Lightsail**: $3.50/month
- **Route 53**: $0.50/month  
- **Lambda/SES**: ~$0.00 (free tier)
- **Total**: ~$4.00/month

---

## 🆘 Need Help?

### Common Issues
- **DNS not working**: Wait 24-48 hours for propagation
- **Website not loading**: Check Nginx config and restart
- **Contact form not working**: Verify API Gateway URL and SES email
- **SSL issues**: Ensure DNS is working first

### Check Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Lambda logs
sam logs -n ContactFormFunction --stack-name edites-contact-form --tail
```

---

## 🎉 Final Result

Once complete, you'll have:
- ✅ Professional website at `https://editessolutions.com`
- ✅ Working contact form sending to `mauro@editessolutions.com`
- ✅ SSL certificate (HTTPS)
- ✅ SEO optimized
- ✅ Bilingual (EN/ES)
- ✅ Mobile responsive
- ✅ Cost: ~$4/month

**Total time**: ~30 minutes
**Your business is online!** 🚀