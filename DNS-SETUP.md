# DNS Setup for editessolutions.com

## Your Lightsail IP Address: `44.204.243.42`

Follow these steps to connect your domain to your Lightsail instance.

---

## 🌐 Route 53 DNS Configuration

### Step 1: Access Route 53 Console

1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Click on "Hosted zones"
3. Find and click on `editessolutions.com`

### Step 2: Create A Records

Create these DNS records in your hosted zone:

#### **Root Domain A Record**
- **Name**: (leave blank)
- **Type**: A
- **Value**: `44.204.243.42`
- **TTL**: 300

#### **WWW Subdomain A Record**
- **Name**: `www`
- **Type**: A
- **Value**: `44.204.243.42`
- **TTL**: 300

### Step 3: Verify Records

After creating the records, your Route 53 hosted zone should show:

```
Name                    Type    Value
editessolutions.com     A       44.204.243.42
www.editessolutions.com A       44.204.243.42
```

---

## 🔍 Testing DNS Propagation

### Command Line Tests

```bash
# Test root domain
nslookup editessolutions.com

# Test www subdomain  
nslookup www.editessolutions.com

# Test with dig (more detailed)
dig editessolutions.com
dig www.editessolutions.com
```

### Expected Results

You should see `44.204.243.42` in the response for both domains.

### Online Tools

- [DNS Checker](https://dnschecker.org/) - Check propagation globally
- [What's My DNS](https://www.whatsmydns.net/) - Worldwide DNS lookup

---

## 🖥️ Lightsail Web Server Configuration

Make sure your Nginx configuration matches your domain:

### Update Nginx Config

```bash
# SSH into your Lightsail instance
sudo nano /etc/nginx/sites-available/editessolutions
```

Ensure the `server_name` directive includes your domain:

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
}
```

### Restart Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate Setup

Once DNS is working, set up SSL:

```bash
# Install Certbot (if not already installed)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d editessolutions.com -d www.editessolutions.com
```

---

## ✅ Verification Checklist

### DNS Tests
- [ ] `nslookup editessolutions.com` returns `44.204.243.42`
- [ ] `nslookup www.editessolutions.com` returns `44.204.243.42`
- [ ] DNS propagation complete (check dnschecker.org)

### Website Tests
- [ ] `http://editessolutions.com` loads your website
- [ ] `http://www.editessolutions.com` loads your website
- [ ] Both URLs redirect to HTTPS after SSL setup

### Contact Form Tests
- [ ] Contact form submits successfully
- [ ] Email notifications arrive at `mauro@editessolutions.com`

---

## 🚨 Troubleshooting

### DNS Not Resolving
1. **Check nameservers**: Ensure your domain registrar uses AWS nameservers
2. **Wait for propagation**: Can take 24-48 hours
3. **Clear DNS cache**: `sudo systemctl flush-dns` (Linux) or `ipconfig /flushdns` (Windows)

### Website Not Loading
1. **Check Lightsail firewall**: Ensure ports 80 and 443 are open
2. **Test Nginx**: `sudo nginx -t`
3. **Check logs**: `sudo tail -f /var/log/nginx/error.log`

### SSL Certificate Issues
1. **Ensure DNS is working first**: SSL requires working DNS
2. **Check domain validation**: Make sure both domains resolve
3. **Rate limits**: Let's Encrypt has rate limits, wait if needed

---

## 📞 Quick Commands Reference

```bash
# Test website locally on Lightsail
curl -I localhost

# Test from internet
curl -I http://44.204.243.42

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl reload nginx
sudo systemctl restart nginx
```

---

## 🎯 Next Steps

1. **Create the A records** in Route 53 as described above
2. **Wait 5-10 minutes** for DNS propagation
3. **Test the domains** using the commands provided
4. **Set up SSL certificate** once DNS is working
5. **Update frontend config** with your Lambda API Gateway URL

Your website will be live at:
- **https://editessolutions.com**
- **https://www.editessolutions.com**

🚀 **You're almost there!**