const nodemailer = require('nodemailer');

// Validate SMTP configuration
function validateSMTPConfig() {
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    
    if (!smtpEmail || !smtpPassword) {
        console.error('⚠️  SMTP Configuration Missing!');
        console.error('   SMTP_EMAIL:', smtpEmail ? '✓ Set' : '✗ Missing');
        console.error('   SMTP_PASSWORD:', smtpPassword ? '✓ Set' : '✗ Missing');
        console.error('   Please check your .env file in the project root.');
        return false;
    }
    return true;
}

// Create SMTP transporter using GoDaddy settings
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
    debug: process.env.NODE_ENV !== 'production', // Enable debug in development
    logger: process.env.NODE_ENV !== 'production', // Enable logging in development
});

// Verify transporter configuration on startup
if (require.main === module || process.env.NODE_ENV !== 'production') {
    validateSMTPConfig();
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ SMTP Connection Failed:', error.message);
            console.error('   Check your SMTP credentials in .env file');
        } else {
            console.log('✅ SMTP Server Ready - Emails can be sent');
        }
    });
}

/**
 * Send notification email to Sales team when contact form is submitted
 */
async function sendContactNotification(submission) {
    const { name, email, project, message } = submission;
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'Sales@archikmor.com';

    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';
    const mailOptions = {
        from: `"ARCHIKMOR Contact Form" <${process.env.SMTP_EMAIL || 'Sales@archikmor.com'}>`,
        to: recipientEmail,
        subject: `🔔 New Contact Form Submission from ${name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 30px 20px; text-align: center; }
                    .header h2 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px; }
                    .header .timestamp { font-size: 12px; opacity: 0.9; margin-top: 10px; }
                    .content { background: #F5F3EE; padding: 30px; }
                    .field { margin-bottom: 20px; }
                    .label { font-weight: 600; color: #7A7A4F; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .value { padding: 15px; background: white; border-left: 4px solid #D9C9A3; border-radius: 4px; color: #2D2D2D; }
                    .message-value { white-space: pre-wrap; }
                    .action-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 10px 25px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .action-button:hover { background: #B8C2A8; }
                    .footer { text-align: center; padding: 20px; color: #7A7A4F; font-size: 12px; background: white; }
                    .footer p { margin: 5px 0; }
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .content { padding: 20px 15px !important; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>New Contact Form Submission</h2>
                        <div class="timestamp">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</div>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name</div>
                            <div class="value">${escapeHtml(name)}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email</div>
                            <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #7A7A4F; text-decoration: none;">${escapeHtml(email)}</a></div>
                        </div>
                        <div class="field">
                            <div class="label">Project Type</div>
                            <div class="value">${escapeHtml(project || 'Not specified')}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message</div>
                            <div class="value message-value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${escapeHtml(email)}?subject=Re: Your inquiry to ARCHIKMOR" class="action-button">Reply to ${escapeHtml(name)}</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>ARCHIKMOR - Timeless Harmony</p>
                        <p>This email was sent from the contact form on your website.</p>
                        <p><a href="${websiteUrl}" style="color: #7A7A4F; text-decoration: none;">View Website</a></p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
🔔 New Contact Form Submission
${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}

Name: ${name}
Email: ${email}
Project Type: ${project || 'Not specified'}

Message:
${message}

---
Reply to: ${email}
View website: ${websiteUrl}

ARCHIKMOR - Timeless Harmony
        `.trim(),
    };

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        console.log('📧 Attempting to send notification email to:', recipientEmail);
        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Contact notification email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', recipientEmail);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send contact notification email');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Command:', error.command);
        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        throw error;
    }
}

/**
 * Send confirmation email to user after contact form submission
 */
async function sendContactConfirmation(submission) {
    const { name, email, project } = submission;
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const projectType = project ? project.toLowerCase() : '';
    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';
    
    // Project-specific content
    let projectSpecificContent = '';
    let estimatedResponseTime = '24-48 hours';
    
    if (projectType.includes('living') || projectType.includes('room')) {
        projectSpecificContent = '<p><strong>Living Room Collections:</strong> Explore our curated living room designs featuring custom wood panels, elegant furniture, and timeless architectural elements perfect for creating warm, inviting spaces.</p>';
        estimatedResponseTime = '24-48 hours';
    } else if (projectType.includes('bedroom')) {
        projectSpecificContent = '<p><strong>Bedroom Collections:</strong> Discover our bedroom designs that combine comfort with sophisticated wood craftsmanship, creating serene retreats for rest and relaxation.</p>';
        estimatedResponseTime = '24-48 hours';
    } else if (projectType.includes('kitchen')) {
        projectSpecificContent = '<p><strong>Kitchen Collections:</strong> Browse our kitchen designs featuring custom woodwork, cabinetry, and architectural elements that bring warmth and functionality to the heart of your home.</p>';
        estimatedResponseTime = '48-72 hours';
    } else if (projectType.includes('workspace') || projectType.includes('office')) {
        projectSpecificContent = '<p><strong>Workspace Collections:</strong> View our workspace solutions designed to inspire productivity with elegant wood furniture and thoughtful space planning.</p>';
        estimatedResponseTime = '24-48 hours';
    } else if (projectType.includes('architectural') || projectType.includes('wood')) {
        projectSpecificContent = '<p><strong>Architectural Wood Collections:</strong> Explore our bespoke architectural woodwork including custom panels, beams, and structural elements that define modern interiors.</p>';
        estimatedResponseTime = '48-72 hours';
    }

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: 'Thank You for Contacting ARCHIKMOR',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 40px 30px; text-align: center; }
                    .header h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; margin: 0 0 10px 0; letter-spacing: 3px; }
                    .header p { font-size: 14px; margin: 0; font-style: italic; opacity: 0.95; }
                    .content { background: #F5F3EE; padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 25px; color: #2D2D2D; font-weight: 500; }
                    .message { margin-bottom: 25px; color: #2D2D2D; }
                    .message p { margin-bottom: 15px; }
                    .highlight-box { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .highlight-box strong { color: #7A7A4F; display: block; margin-bottom: 10px; font-size: 16px; }
                    .contact-info { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .contact-info p { margin: 8px 0; color: #2D2D2D; }
                    .contact-info a { color: #7A7A4F; text-decoration: none; }
                    .contact-info a:hover { text-decoration: underline; }
                    .social-links { text-align: center; margin: 30px 0; padding: 20px 0; border-top: 1px solid #D9C9A3; border-bottom: 1px solid #D9C9A3; }
                    .social-links a { display: inline-block; margin: 0 15px; color: #7A7A4F; font-size: 24px; text-decoration: none; }
                    .social-links a:hover { color: #B8C2A8; }
                    .cta-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .cta-button:hover { background: #B8C2A8; }
                    .footer { text-align: center; padding: 30px 20px; color: #7A7A4F; font-size: 12px; background: white; }
                    .footer p { margin: 5px 0; }
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .content { padding: 30px 20px !important; }
                        .header { padding: 30px 20px !important; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear ${escapeHtml(name)},</div>
                        <div class="message">
                            <p>Thank you for reaching out to ARCHIKMOR! We have received your contact form submission and truly appreciate your interest in our design services.</p>
                            <p>Our team will review your message and get back to you as soon as possible, typically within <strong>${estimatedResponseTime}</strong>.</p>
                        </div>
                        ${projectSpecificContent ? `<div class="highlight-box">${projectSpecificContent}</div>` : ''}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${websiteUrl}/#catalogue" class="cta-button">View Our Catalog</a>
                        </div>
                        <div class="contact-info">
                            <p><strong>In the meantime, feel free to connect with us:</strong></p>
                            <p>📧 <a href="mailto:Sales@archikmor.com">Sales@archikmor.com</a></p>
                            <p>📞 <a href="tel:+212783101423">+212 783101423</a></p>
                            <p>📍 KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca</p>
                        </div>
                        <div class="social-links">
                            <a href="https://www.facebook.com/share/1Dk1u67RN5/" target="_blank" title="Facebook">📘</a>
                            <a href="https://www.instagram.com/archikmor?igsh=MXY4OW9oMjEzZXo0dw==" target="_blank" title="Instagram">📷</a>
                            <a href="https://www.tiktok.com/@archikmor?_r=1&_t=ZS-917PmUAqhAv" target="_blank" title="TikTok">🎵</a>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>We look forward to helping you create timeless spaces with wood, wisdom, and harmony.</p>
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                        <p>This email was sent to ${escapeHtml(email)}</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${name},

Thank you for reaching out to ARCHIKMOR! We have received your contact form submission and truly appreciate your interest in our design services.

Our team will review your message and get back to you as soon as possible, typically within ${estimatedResponseTime}.

${projectSpecificContent ? projectSpecificContent.replace(/<[^>]*>/g, '') + '\n' : ''}
View our catalog: ${websiteUrl}/#catalogue

In the meantime, feel free to connect with us:
Email: Sales@archikmor.com
Phone: +212 783101423
Address: KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca

Follow us on social media:
Facebook: https://www.facebook.com/share/1Dk1u67RN5/
Instagram: https://www.instagram.com/archikmor
TikTok: https://www.tiktok.com/@archikmor

We look forward to helping you create timeless spaces with wood, wisdom, and harmony.

Best regards,
The ARCHIKMOR Team

---
© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
This email was sent to ${email}
        `.trim(),
    };

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        console.log('📧 Attempting to send confirmation email to:', email);
        
        // Validate SMTP config before sending
        if (!validateSMTPConfig()) {
            const errorMsg = 'SMTP configuration is missing. Please check your .env file.';
            console.error('❌ Failed to send contact confirmation email:', errorMsg);
            throw new Error(errorMsg);
        }

        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Contact confirmation email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send contact confirmation email');
        console.error('   To:', email);
        console.error('   Error:', error.message);
        console.error('   Error Code:', error.code || 'N/A');
        console.error('   Command:', error.command || 'N/A');
        
        if (error.code === 'EAUTH') {
            console.error('   ⚠️  SMTP Authentication Error - Invalid credentials!');
            console.error('   Please check your SMTP_EMAIL and SMTP_PASSWORD in .env file');
            console.error('   Current SMTP_EMAIL:', process.env.SMTP_EMAIL || 'NOT SET');
            console.error('   Current SMTP_HOST:', process.env.SMTP_HOST || 'smtpout.secureserver.net (default)');
            console.error('   Current SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
        } else if (error.code === 'ECONNECTION') {
            console.error('   ⚠️  SMTP Connection Error - Cannot connect to server!');
            console.error('   Please check your SMTP_HOST and SMTP_PORT in .env file');
        } else if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        
        throw error;
    }
}

/**
 * Send notification email to Sales team when newsletter subscription is received
 */
async function sendNewsletterNotification(subscriber) {
    const { name, email, subscribedAt } = subscriber;
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'Sales@archikmor.com';
    const subscriptionDate = new Date(subscribedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';
    const mailOptions = {
        from: `"ARCHIKMOR Newsletter" <${process.env.SMTP_EMAIL || 'Sales@archikmor.com'}>`,
        to: recipientEmail,
        subject: `📬 New Newsletter Subscription: ${name || email}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 30px 20px; text-align: center; }
                    .header h2 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 2px; }
                    .header .timestamp { font-size: 12px; opacity: 0.9; margin-top: 10px; }
                    .content { background: #F5F3EE; padding: 30px; }
                    .field { margin-bottom: 20px; }
                    .label { font-weight: 600; color: #7A7A4F; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .value { padding: 15px; background: white; border-left: 4px solid #D9C9A3; border-radius: 4px; color: #2D2D2D; }
                    .action-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 10px 25px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .action-button:hover { background: #B8C2A8; }
                    .footer { text-align: center; padding: 20px; color: #7A7A4F; font-size: 12px; background: white; }
                    .footer p { margin: 5px 0; }
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .content { padding: 20px 15px !important; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>New Newsletter Subscription</h2>
                        <div class="timestamp">${subscriptionDate}</div>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name</div>
                            <div class="value">${escapeHtml(name || 'Not provided')}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email</div>
                            <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #7A7A4F; text-decoration: none;">${escapeHtml(email)}</a></div>
                        </div>
                        <div class="field">
                            <div class="label">Subscription Date</div>
                            <div class="value">${escapeHtml(subscriptionDate)}</div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:${escapeHtml(email)}?subject=Welcome to ARCHIKMOR Newsletter" class="action-button">Send Welcome Email</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>ARCHIKMOR - Timeless Harmony</p>
                        <p>This email was sent from the newsletter subscription form on your website.</p>
                        <p><a href="${websiteUrl}" style="color: #7A7A4F; text-decoration: none;">View Website</a></p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
📬 New Newsletter Subscription
${subscriptionDate}

Name: ${name || 'Not provided'}
Email: ${email}
Subscription Date: ${subscriptionDate}

---
Reply to: ${email}
View website: ${websiteUrl}

ARCHIKMOR - Timeless Harmony
        `.trim(),
    };

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        console.log('📧 Attempting to send newsletter notification email to:', recipientEmail);
        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Newsletter notification email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', recipientEmail);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send newsletter notification email');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Command:', error.command);
        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        throw error;
    }
}

/**
 * Send confirmation email to subscriber after newsletter subscription
 */
async function sendNewsletterConfirmation(subscriber) {
    const { name, email } = subscriber;
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const displayName = name || 'Valued Subscriber';
    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: 'Welcome to ARCHIKMOR Newsletter!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 40px 30px; text-align: center; }
                    .header h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; margin: 0 0 10px 0; letter-spacing: 3px; }
                    .header p { font-size: 14px; margin: 0; font-style: italic; opacity: 0.95; }
                    .content { background: #F5F3EE; padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 25px; color: #2D2D2D; font-weight: 500; }
                    .message { margin-bottom: 25px; color: #2D2D2D; }
                    .message p { margin-bottom: 15px; }
                    .message ul { margin: 15px 0; padding-left: 25px; }
                    .message li { margin-bottom: 10px; }
                    .welcome-offer { background: linear-gradient(135deg, #D9C9A3 0%, #B8C2A8 100%); padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center; color: #2D2D2D; }
                    .welcome-offer h3 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 24px; margin: 0 0 15px 0; color: #7A7A4F; }
                    .welcome-offer p { margin: 10px 0; font-size: 16px; }
                    .highlight-box { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .highlight-box strong { color: #7A7A4F; display: block; margin-bottom: 10px; font-size: 16px; }
                    .contact-info { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .contact-info p { margin: 8px 0; color: #2D2D2D; }
                    .contact-info a { color: #7A7A4F; text-decoration: none; }
                    .contact-info a:hover { text-decoration: underline; }
                    .social-links { text-align: center; margin: 30px 0; padding: 20px 0; border-top: 1px solid #D9C9A3; border-bottom: 1px solid #D9C9A3; }
                    .social-links a { display: inline-block; margin: 0 15px; color: #7A7A4F; font-size: 24px; text-decoration: none; }
                    .social-links a:hover { color: #B8C2A8; }
                    .cta-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .cta-button:hover { background: #B8C2A8; }
                    .portfolio-preview { background: white; padding: 20px; margin: 25px 0; border-radius: 4px; text-align: center; }
                    .portfolio-preview h4 { color: #7A7A4F; font-family: 'Playfair Display', 'Georgia', serif; margin-bottom: 15px; }
                    .footer { text-align: center; padding: 30px 20px; color: #7A7A4F; font-size: 12px; background: white; }
                    .footer p { margin: 5px 0; }
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .content { padding: 30px 20px !important; }
                        .header { padding: 30px 20px !important; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear ${escapeHtml(displayName)},</div>
                        <div class="message">
                            <p>Thank you for subscribing to the ARCHIKMOR newsletter! We're thrilled to have you join our community of design enthusiasts.</p>
                            <p>You'll now receive exclusive updates about:</p>
                            <ul>
                                <li>Latest design collections and furniture launches</li>
                                <li>Inspirational project showcases</li>
                                <li>Special offers and members-only promotions</li>
                                <li>Design tips and trends</li>
                                <li>Behind-the-scenes content from our studio</li>
                            </ul>
                        </div>
                        <div class="welcome-offer">
                            <h3>🎉 Welcome Offer</h3>
                            <p><strong>As a new subscriber, enjoy exclusive access to our complete catalog and special consultation offers!</strong></p>
                            <p style="margin-top: 15px;">
                                <a href="${websiteUrl}/#catalogue" class="cta-button" style="background: #7A7A4F; color: #F5F3EE;">Download Free Catalog</a>
                            </p>
                        </div>
                        <div class="portfolio-preview">
                            <h4>Explore Our Collections</h4>
                            <p>Discover our signature designs featuring custom woodwork, elegant furniture, and timeless architectural elements.</p>
                            <p style="margin-top: 15px;">
                                <a href="${websiteUrl}/#preview" class="cta-button">View Portfolio</a>
                            </p>
                        </div>
                        <div class="contact-info">
                            <p><strong>Stay connected with us:</strong></p>
                            <p>📧 <a href="mailto:Sales@archikmor.com">Sales@archikmor.com</a></p>
                            <p>📞 <a href="tel:+212783101423">+212 783101423</a></p>
                            <p>📍 KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca</p>
                        </div>
                        <div class="social-links">
                            <p style="margin-bottom: 15px; color: #7A7A4F; font-weight: 500;">Follow us for daily inspiration:</p>
                            <a href="https://www.facebook.com/share/1Dk1u67RN5/" target="_blank" title="Facebook">📘 Facebook</a>
                            <a href="https://www.instagram.com/archikmor?igsh=MXY4OW9oMjEzZXo0dw==" target="_blank" title="Instagram">📷 Instagram</a>
                            <a href="https://www.tiktok.com/@archikmor?_r=1&_t=ZS-917PmUAqhAv" target="_blank" title="TikTok">🎵 TikTok</a>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>We look forward to sharing our passion for timeless design with you.</p>
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                        <p><small>You can unsubscribe at any time by replying to this email with "UNSUBSCRIBE" in the subject line.</small></p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${displayName},

Thank you for subscribing to the ARCHIKMOR newsletter! We're thrilled to have you join our community of design enthusiasts.

You'll now receive exclusive updates about:
- Latest design collections and furniture launches
- Inspirational project showcases
- Special offers and members-only promotions
- Design tips and trends
- Behind-the-scenes content from our studio

🎉 WELCOME OFFER
As a new subscriber, enjoy exclusive access to our complete catalog and special consultation offers!
Download your free catalog: ${websiteUrl}/#catalogue

Explore our collections: ${websiteUrl}/#preview

Stay connected with us:
Email: Sales@archikmor.com
Phone: +212 783101423
Address: KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca

Follow us on social media:
Facebook: https://www.facebook.com/share/1Dk1u67RN5/
Instagram: https://www.instagram.com/archikmor
TikTok: https://www.tiktok.com/@archikmor

We look forward to sharing our passion for timeless design with you.

Best regards,
The ARCHIKMOR Team

---
© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
You can unsubscribe at any time by replying to this email with "UNSUBSCRIBE" in the subject line.
        `.trim(),
    };

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        console.log('📧 Attempting to send newsletter confirmation email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Newsletter confirmation email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send newsletter confirmation email');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Command:', error.command);
        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        throw error;
    }
}

/**
 * Send catalogue PDF via email
 */
async function sendCatalogueEmail(recipientEmail) {
    const path = require('path');
    const fs = require('fs');
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const cataloguePath = path.join(__dirname, '..', 'catalogue', 'Archikmor-Catalog2026.pdf');

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    // Check if catalogue file exists
    if (!fs.existsSync(cataloguePath)) {
        throw new Error('Catalogue file not found');
    }

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: recipientEmail,
        subject: 'Your ARCHIKMOR Catalogue 2026',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #2D2D2D; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #7A7A4F; color: #F5F3EE; padding: 30px; text-align: center; }
                    .content { background: #F5F3EE; padding: 30px; }
                    .greeting { font-size: 18px; margin-bottom: 20px; }
                    .message { margin-bottom: 20px; }
                    .attachment-info { background: white; padding: 20px; margin-top: 20px; border-left: 3px solid #D9C9A3; }
                    .contact-info { background: white; padding: 20px; margin-top: 20px; border-left: 3px solid #D9C9A3; }
                    .contact-info p { margin: 5px 0; }
                    .footer { text-align: center; padding: 20px; color: #7A7A4F; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear Valued Customer,</div>
                        <div class="message">
                            <p>Thank you for your interest in ARCHIKMOR! As requested, we're pleased to send you our complete catalogue for 2026.</p>
                            <p>The catalogue is attached to this email and includes:</p>
                            <ul>
                                <li>6 signature collections</li>
                                <li>Detailed specifications & finishes</li>
                                <li>High-resolution project imagery</li>
                                <li>Living room, bedroom, kitchen, workspace, and architectural wood collections</li>
                            </ul>
                        </div>
                        <div class="attachment-info">
                            <p><strong>📎 Attachment:</strong> ARCHIKMOR Catalogue 2026 (PDF)</p>
                            <p>If you don't see the attachment, please check your spam folder or contact us directly.</p>
                        </div>
                        <div class="contact-info">
                            <p><strong>Have questions or need assistance?</strong></p>
                            <p>📧 Email: Sales@archikmor.com</p>
                            <p>📞 Phone: +212 783101423</p>
                            <p>📍 Address: KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca</p>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>We look forward to helping you create timeless spaces with wood, wisdom, and harmony.</p>
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear Valued Customer,

Thank you for your interest in ARCHIKMOR! As requested, we're pleased to send you our complete catalogue for 2026.

The catalogue is attached to this email and includes:
- 6 signature collections
- Detailed specifications & finishes
- High-resolution project imagery
- Living room, bedroom, kitchen, workspace, and architectural wood collections

Attachment: ARCHIKMOR Catalogue 2026 (PDF)
If you don't see the attachment, please check your spam folder or contact us directly.

Have questions or need assistance?
Email: Sales@archikmor.com
Phone: +212 783101423
Address: KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca

We look forward to helping you create timeless spaces with wood, wisdom, and harmony.

Best regards,
The ARCHIKMOR Team

---
© 2024 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
        `.trim(),
        attachments: [
            {
                filename: 'ARCHIKMOR-Catalogue-2026.pdf',
                path: cataloguePath,
            },
        ],
    };

    try {
        console.log('📧 Attempting to send catalogue email to:', recipientEmail);
        
        // Verify file exists and is readable before sending
        if (!fs.existsSync(cataloguePath)) {
            const error = new Error('Catalogue file not found');
            error.code = 'FILE_NOT_FOUND';
            throw error;
        }
        
        // Check file size (some email servers have attachment size limits)
        const fileStats = fs.statSync(cataloguePath);
        const fileSizeMB = fileStats.size / (1024 * 1024);
        console.log('   Catalogue file size:', fileSizeMB.toFixed(2), 'MB');
        
        if (fileSizeMB > 25) {
            console.warn('   ⚠️  Warning: File size exceeds 25MB, may be rejected by some email servers');
        }
        
        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Catalogue email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', recipientEmail);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send catalogue email');
        console.error('   To:', recipientEmail);
        console.error('   Error:', error.message);
        console.error('   Code:', error.code || 'N/A');
        console.error('   Command:', error.command || 'N/A');
        
        if (error.code === 'EAUTH') {
            console.error('   ⚠️  SMTP Authentication Error');
            console.error('   Please verify SMTP_EMAIL and SMTP_PASSWORD in .env file');
        } else if (error.code === 'ECONNECTION') {
            console.error('   ⚠️  SMTP Connection Error');
            console.error('   Please verify SMTP_HOST and SMTP_PORT in .env file');
        } else if (error.code === 'FILE_NOT_FOUND') {
            console.error('   ⚠️  Catalogue File Not Found');
            console.error('   Expected path:', cataloguePath);
        }
        
        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        
        throw error;
    }
}

/**
 * Send follow-up email to contact form submitter (3-5 days after initial submission)
 */
async function sendContactFollowUp(submission) {
    const { name, email, project } = submission;
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: 'Following Up on Your ARCHIKMOR Inquiry',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 40px 30px; text-align: center; }
                    .header h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; margin: 0 0 10px 0; letter-spacing: 3px; }
                    .header p { font-size: 14px; margin: 0; font-style: italic; opacity: 0.95; }
                    .content { background: #F5F3EE; padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 25px; color: #2D2D2D; font-weight: 500; }
                    .message { margin-bottom: 25px; color: #2D2D2D; }
                    .message p { margin-bottom: 15px; }
                    .highlight-box { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .contact-info { background: white; padding: 25px; margin: 25px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .contact-info p { margin: 8px 0; color: #2D2D2D; }
                    .contact-info a { color: #7A7A4F; text-decoration: none; }
                    .cta-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .cta-button:hover { background: #B8C2A8; }
                    .footer { text-align: center; padding: 30px 20px; color: #7A7A4F; font-size: 12px; background: white; }
                    .footer p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear ${escapeHtml(name)},</div>
                        <div class="message">
                            <p>We wanted to follow up on your recent inquiry to ARCHIKMOR. We hope you've had a chance to explore our collections and design philosophy.</p>
                            <p>If you have any additional questions or would like to schedule a consultation, we're here to help bring your vision to life.</p>
                        </div>
                        <div class="highlight-box">
                            <p><strong>What's Next?</strong></p>
                            <p>• Schedule a personalized consultation to discuss your project</p>
                            <p>• Explore our complete catalog with detailed specifications</p>
                            <p>• View our portfolio of completed projects</p>
                            <p>• Get in touch with our design team</p>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${websiteUrl}/#catalogue" class="cta-button">View Our Catalog</a>
                            <a href="${websiteUrl}/#contact" class="cta-button" style="margin-left: 10px;">Contact Us</a>
                        </div>
                        <div class="contact-info">
                            <p><strong>Ready to get started?</strong></p>
                            <p>📧 <a href="mailto:Sales@archikmor.com">Sales@archikmor.com</a></p>
                            <p>📞 <a href="tel:+212783101423">+212 783101423</a></p>
                            <p>📍 KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca</p>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>We look forward to helping you create timeless spaces with wood, wisdom, and harmony.</p>
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                        <p>This is a follow-up email regarding your inquiry. If you've already been in contact with us, please disregard this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${name},

We wanted to follow up on your recent inquiry to ARCHIKMOR. We hope you've had a chance to explore our collections and design philosophy.

If you have any additional questions or would like to schedule a consultation, we're here to help bring your vision to life.

What's Next?
• Schedule a personalized consultation to discuss your project
• Explore our complete catalog with detailed specifications
• View our portfolio of completed projects
• Get in touch with our design team

View our catalog: ${websiteUrl}/#catalogue
Contact us: ${websiteUrl}/#contact

Ready to get started?
Email: Sales@archikmor.com
Phone: +212 783101423
Address: KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca

We look forward to helping you create timeless spaces with wood, wisdom, and harmony.

Best regards,
The ARCHIKMOR Team

---
© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
This is a follow-up email regarding your inquiry. If you've already been in contact with us, please disregard this message.
        `.trim(),
    };

    // Validate SMTP config before sending
    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        console.log('📧 Attempting to send follow-up email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.info('✅ Contact follow-up email sent successfully!');
        console.info('   Message ID:', info.messageId);
        console.info('   To:', email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send contact follow-up email');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        if (error.response) {
            console.error('   SMTP Response:', error.response);
        }
        throw error;
    }
}

/**
 * Send newsletter welcome series email (Day 3 - Portfolio Showcase)
 */
async function sendNewsletterWelcomeSeriesDay3(subscriber) {
    const { name, email } = subscriber;
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const displayName = name || 'Valued Subscriber';
    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: 'Discover Our Signature Collections - ARCHIKMOR',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 40px 30px; text-align: center; }
                    .header h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; margin: 0 0 10px 0; letter-spacing: 3px; }
                    .content { background: #F5F3EE; padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 25px; color: #2D2D2D; font-weight: 500; }
                    .message { margin-bottom: 25px; color: #2D2D2D; }
                    .collection-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .collection-box h3 { color: #7A7A4F; font-family: 'Playfair Display', 'Georgia', serif; margin-bottom: 10px; }
                    .cta-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .footer { text-align: center; padding: 30px 20px; color: #7A7A4F; font-size: 12px; background: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear ${escapeHtml(displayName)},</div>
                        <div class="message">
                            <p>We're excited to share our signature collections with you! Each piece is crafted with meticulous attention to detail, combining timeless design with exceptional wood craftsmanship.</p>
                        </div>
                        <div class="collection-box">
                            <h3>Living Room Collections</h3>
                            <p>Elegant furniture and custom wood panels that bring warmth and sophistication to your living spaces.</p>
                        </div>
                        <div class="collection-box">
                            <h3>Bedroom Collections</h3>
                            <p>Serene designs that combine comfort with sophisticated wood craftsmanship for restful retreats.</p>
                        </div>
                        <div class="collection-box">
                            <h3>Kitchen & Workspace</h3>
                            <p>Functional beauty meets timeless design in our kitchen and workspace collections.</p>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${websiteUrl}/#preview" class="cta-button">Explore Our Portfolio</a>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${displayName},

We're excited to share our signature collections with you! Each piece is crafted with meticulous attention to detail, combining timeless design with exceptional wood craftsmanship.

Living Room Collections: Elegant furniture and custom wood panels that bring warmth and sophistication to your living spaces.

Bedroom Collections: Serene designs that combine comfort with sophisticated wood craftsmanship for restful retreats.

Kitchen & Workspace: Functional beauty meets timeless design in our kitchen and workspace collections.

Explore our portfolio: ${websiteUrl}/#preview

Best regards,
The ARCHIKMOR Team

---
© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
        `.trim(),
    };

    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send newsletter welcome series Day 3 email');
        throw error;
    }
}

/**
 * Send newsletter welcome series email (Day 7 - Design Tips & Special Offer)
 */
async function sendNewsletterWelcomeSeriesDay7(subscriber) {
    const { name, email } = subscriber;
    const senderEmail = process.env.SMTP_EMAIL || 'Sales@archikmor.com';
    const senderName = process.env.SMTP_FROM_NAME || 'ARCHIKMOR Team';
    const displayName = name || 'Valued Subscriber';
    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3004';

    const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: 'Design Tips & Exclusive Offer - ARCHIKMOR',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Montserrat', 'Arial', sans-serif; line-height: 1.6; color: #2D2D2D; margin: 0; padding: 0; background-color: #F5F3EE; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                    .header { background: linear-gradient(135deg, #7A7A4F 0%, #B8C2A8 100%); color: #F5F3EE; padding: 40px 30px; text-align: center; }
                    .header h1 { font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; margin: 0 0 10px 0; letter-spacing: 3px; }
                    .content { background: #F5F3EE; padding: 40px 30px; }
                    .greeting { font-size: 20px; margin-bottom: 25px; color: #2D2D2D; font-weight: 500; }
                    .message { margin-bottom: 25px; color: #2D2D2D; }
                    .tip-box { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #D9C9A3; border-radius: 4px; }
                    .offer-box { background: linear-gradient(135deg, #D9C9A3 0%, #B8C2A8 100%); padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center; }
                    .cta-button { display: inline-block; background: #7A7A4F; color: #F5F3EE; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 500; }
                    .footer { text-align: center; padding: 30px 20px; color: #7A7A4F; font-size: 12px; background: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ARCHIKMOR</h1>
                        <p>Timeless Harmony</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Dear ${escapeHtml(displayName)},</div>
                        <div class="message">
                            <p>As a valued subscriber, we're sharing some design tips and an exclusive offer just for you!</p>
                        </div>
                        <div class="tip-box">
                            <strong>Design Tip #1:</strong> When choosing wood furniture, consider the natural grain patterns - they add character and warmth to any space.
                        </div>
                        <div class="tip-box">
                            <strong>Design Tip #2:</strong> Mix different wood tones carefully. Stick to 2-3 complementary shades for a cohesive look.
                        </div>
                        <div class="tip-box">
                            <strong>Design Tip #3:</strong> Custom woodwork allows you to maximize space while maintaining aesthetic appeal - perfect for modern living.
                        </div>
                        <div class="offer-box">
                            <h3 style="color: #7A7A4F; margin-top: 0;">🎁 Exclusive Subscriber Offer</h3>
                            <p style="font-size: 18px; margin: 15px 0;"><strong>Schedule a consultation and receive a complimentary design consultation!</strong></p>
                            <a href="${websiteUrl}/#contact" class="cta-button" style="background: #7A7A4F; color: #F5F3EE;">Book Your Consultation</a>
                        </div>
                        <div class="message" style="margin-top: 30px;">
                            <p>Best regards,<br><strong>The ARCHIKMOR Team</strong></p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Dear ${displayName},

As a valued subscriber, we're sharing some design tips and an exclusive offer just for you!

Design Tip #1: When choosing wood furniture, consider the natural grain patterns - they add character and warmth to any space.

Design Tip #2: Mix different wood tones carefully. Stick to 2-3 complementary shades for a cohesive look.

Design Tip #3: Custom woodwork allows you to maximize space while maintaining aesthetic appeal - perfect for modern living.

🎁 EXCLUSIVE SUBSCRIBER OFFER
Schedule a consultation and receive a complimentary design consultation!

Book your consultation: ${websiteUrl}/#contact

Best regards,
The ARCHIKMOR Team

---
© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony.
        `.trim(),
    };

    if (!validateSMTPConfig()) {
        throw new Error('SMTP configuration is missing. Please check your .env file.');
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send newsletter welcome series Day 7 email');
        throw error;
    }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

module.exports = {
    validateSMTPConfig,
    sendContactNotification,
    sendContactConfirmation,
    sendNewsletterNotification,
    sendNewsletterConfirmation,
    sendCatalogueEmail,
    sendContactFollowUp,
    sendNewsletterWelcomeSeriesDay3,
    sendNewsletterWelcomeSeriesDay7,
};

