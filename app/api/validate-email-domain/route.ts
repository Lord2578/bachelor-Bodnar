import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({
        valid: false,
        message: 'Будь ласка, вкажіть email'
      }, { status: 400 });
    }
    
    const domain = email.split('@')[1];
    
    if (!domain) {
      return NextResponse.json({
        valid: false,
        message: 'Некоректний формат email'
      }, { status: 400 });
    }
    
    try {
      const mxRecords = await resolveMx(domain);
      
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json({
          valid: false,
          message: `Домен '${domain}' не має MX-записів, тому не може отримувати електронну пошту`
        });
      }
      
      return NextResponse.json({
        valid: true,
        message: 'Домен електронної пошти валідний'
      });
    } catch {
      return NextResponse.json({
        valid: false,
        message: `Домен '${domain}' недійсний або не має MX-записів`
      });
    }
  } catch (error) {
    console.error('Error validating email domain:', error);
    return NextResponse.json({
      valid: false,
      message: 'Помилка при перевірці домену електронної пошти'
    }, { status: 500 });
  }
} 