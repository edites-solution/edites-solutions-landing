# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML website for Edites Solutions, a technology consulting company. The entire website is contained in a single `index.html` file with embedded CSS and JavaScript.

## Architecture

- **Single-page application**: All content is in `index.html`
- **Embedded styling**: CSS is written within `<style>` tags in the HTML head
- **Embedded scripting**: JavaScript is written within `<script>` tags at the bottom of the HTML
- **Static assets**: Images are stored in the `images/PNG/` directory
- **Internationalization**: Basic i18n support with English/Spanish text switching via JavaScript
- **Responsive design**: CSS uses media queries and flexbox for mobile compatibility

## Key Features

- **Multi-language support**: Toggle between English and Spanish
- **Contact form**: Basic email validation and form submission simulation
- **Smooth scrolling navigation**: CSS scroll-behavior and JavaScript navigation
- **Intersection Observer animations**: Cards animate in when scrolled into view
- **Mobile-responsive menu**: Hamburger menu for mobile devices

## Development

Since this is a static HTML file, no build process is required. Simply:

1. Open `index.html` in a web browser to view the site
2. Edit the HTML file directly to make changes
3. Refresh the browser to see updates

## File Structure

- `index.html` - Main website file containing all HTML, CSS, and JavaScript
- `images/PNG/` - Image assets including logos, company photos, and client logos
- `images/PNG/not-used-images/` - Unused image assets

## Making Changes

When editing this codebase:

- CSS is embedded in the `<style>` section in the HTML head
- JavaScript is embedded in `<script>` tags at the bottom of the HTML body
- Internationalization strings are defined in the `translations` object in JavaScript
- The site uses CSS custom properties (variables) defined in `:root` for consistent theming
- Responsive breakpoints are handled with CSS media queries

## No Build Tools

This project intentionally uses no build tools, package managers, or frameworks. It's designed to be simple and self-contained for easy deployment and maintenance.

## Deployment

The project includes comprehensive deployment documentation:

- **DEPLOYMENT.md** - Complete guide for AWS deployment using Lightsail, Route 53, and Lambda
- **lambda/README.md** - Specific instructions for Lambda contact form deployment
- **lambda/deploy.sh** - Automated deployment script for Lambda function

### Quick Deployment Summary

1. **Static Website**: Deploy to AWS Lightsail ($3.50/month)
2. **Domain**: Configure with Route 53 ($0.50/month)
3. **Contact Form**: AWS Lambda + API Gateway (essentially free)
4. **SSL**: Free Let's Encrypt certificate via Certbot
5. **Total Cost**: ~$4/month for a professional website

## AWS Lambda Contact Form

The project includes a complete serverless contact form implementation:

- **Backend**: AWS Lambda function with SES email delivery
- **Infrastructure**: SAM template for easy deployment
- **Frontend**: Integrated with existing form validation
- **Features**: Bilingual support, input validation, error handling

To deploy the contact form:
```bash
cd lambda && ./deploy.sh
```

Then update `CONFIG.CONTACT_API_URL` in `index.html` with your API Gateway endpoint.