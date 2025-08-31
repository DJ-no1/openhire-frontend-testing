import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, company, subject, message, phone } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // For now, we'll just log the contact form submission
        // In a real implementation, you would:
        // 1. Send an email notification
        // 2. Store in a database
        // 3. Integrate with a CRM system

        console.log('Contact form submission:', {
            name,
            email,
            company,
            subject,
            message,
            phone,
            timestamp: new Date().toISOString()
        });

        // Simulate email sending (replace with actual email service)
        // Example with Nodemailer, SendGrid, or Resend:
        /*
        const emailContent = `
          New contact form submission from OpenHire website:
          
          Name: ${name}
          Email: ${email}
          Company: ${company || 'Not provided'}
          Phone: ${phone || 'Not provided'}
          Subject: ${subject}
          
          Message:
          ${message}
          
          Submitted at: ${new Date().toLocaleString()}
        `;
    
        await sendEmail({
          to: 'hello@openhire.com',
          subject: `New Contact Form: ${subject}`,
          text: emailContent
        });
        */

        // Return success response
        return NextResponse.json(
            {
                message: 'Contact form submitted successfully',
                success: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
