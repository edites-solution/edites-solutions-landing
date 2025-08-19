const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' }); // Change region as needed

exports.handler = async (event) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*', // In production, replace with your domain
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body);
        const { name, email, message, language = 'en' } = body;

        // Basic validation
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: language === 'es' 
                        ? 'Todos los campos son obligatorios.' 
                        : 'All fields are required.'
                })
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: language === 'es' 
                        ? 'Por favor ingrese un email válido.' 
                        : 'Please enter a valid email address.'
                })
            };
        }

        // Sanitize inputs
        const sanitizedName = name.trim().slice(0, 100);
        const sanitizedEmail = email.trim().slice(0, 100);
        const sanitizedMessage = message.trim().slice(0, 1000);

        // Email parameters
        const emailParams = {
            Destination: {
                ToAddresses: [process.env.NOTIFICATION_EMAIL || 'mauro@editessolutions.com']
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                            <h2>New Contact Form Submission - Edites Solutions</h2>
                            <p><strong>Name:</strong> ${sanitizedName}</p>
                            <p><strong>Email:</strong> ${sanitizedEmail}</p>
                            <p><strong>Message:</strong></p>
                            <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
                            <hr>
                            <p><small>Submitted on: ${new Date().toISOString()}</small></p>
                        `
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `
New Contact Form Submission - Edites Solutions

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Message: ${sanitizedMessage}

Submitted on: ${new Date().toISOString()}
                        `
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: `New Contact Form: ${sanitizedName} - Edites Solutions`
                }
            },
            Source: process.env.FROM_EMAIL || 'noreply@editessolutions.com'
        };

        // Send email via SES
        await ses.sendEmail(emailParams).promise();

        // Log the submission (optional - for debugging)
        console.log(`Contact form submitted by ${sanitizedEmail} at ${new Date().toISOString()}`);

        // Success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: language === 'es' 
                    ? 'Mensaje enviado exitosamente. Nos pondremos en contacto pronto.' 
                    : 'Message sent successfully. We will get back to you soon.'
            })
        };

    } catch (error) {
        console.error('Error processing contact form:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error. Please try again later.'
            })
        };
    }
};